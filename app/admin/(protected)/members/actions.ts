'use server'

import { revalidatePath } from 'next/cache'
import * as Sentry from '@sentry/nextjs'
import { createClient } from '@/lib/supabase/server'
import { memberSchema } from '@/lib/validations/member'

export interface MemberActionState {
  error?: string
  ok?: boolean
}

const GENERIC_ERROR = '저장 중 오류가 발생했습니다. 다시 시도해주세요.'
const DUPLICATE_PHONE_ERROR = '이미 등록된 연락처입니다'

function parseForm(formData: FormData) {
  return memberSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    birthday: formData.get('birthday'),
    first_visit_at: formData.get('first_visit_at'),
    allergy_note: formData.get('allergy_note'),
    membership_tier: formData.get('membership_tier') ?? 'regular',
    points: formData.get('points') ?? 0,
  })
}

// Postgres unique_violation 코드
function isDuplicatePhone(error: { code?: string }): boolean {
  return error.code === '23505'
}

export async function createMemberAction(
  _prev: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '입력값을 확인해주세요' }
  }

  const supabase = createClient()
  try {
    const { error } = await supabase.from('members').insert(parsed.data)
    if (error) {
      if (isDuplicatePhone(error)) return { error: DUPLICATE_PHONE_ERROR }
      Sentry.captureException(error)
      return { error: GENERIC_ERROR }
    }
  } catch (err) {
    Sentry.captureException(err)
    return { error: GENERIC_ERROR }
  }

  revalidatePath('/admin/members')
  return { ok: true }
}

export async function updateMemberAction(
  id: string,
  _prev: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '입력값을 확인해주세요' }
  }

  const supabase = createClient()
  try {
    const { error } = await supabase
      .from('members')
      .update(parsed.data)
      .eq('id', id)
    if (error) {
      if (isDuplicatePhone(error)) return { error: DUPLICATE_PHONE_ERROR }
      Sentry.captureException(error)
      return { error: GENERIC_ERROR }
    }
  } catch (err) {
    Sentry.captureException(err)
    return { error: GENERIC_ERROR }
  }

  revalidatePath('/admin/members')
  revalidatePath(`/admin/members/${id}`)
  return { ok: true }
}

// 소프트 삭제 [BR-MEM-11] — 예약/시술 내역 보존
export async function deleteMemberAction(id: string): Promise<void> {
  const supabase = createClient()
  try {
    const { error } = await supabase
      .from('members')
      .update({ is_active: false })
      .eq('id', id)
    if (error) Sentry.captureException(error)
  } catch (err) {
    Sentry.captureException(err)
  }

  revalidatePath('/admin/members')
}

// 회원 상세 모달용 — 시술 히스토리 + 재방문 권장 조회
export interface MemberDetailData {
  lastVisit: {
    visited_at: string
    treatment_name: string
    recommended_return_date: string | null
  } | null
  visits: {
    id: string
    visited_at: string
    price_paid: number
    before_after_photo_url: string | null
    treatment_name: string
  }[]
}

export async function getMemberDetailAction(
  memberId: string,
): Promise<MemberDetailData> {
  const supabase = createClient()
  const [{ data: lastVisitData }, { data: visitData }] = await Promise.all([
    supabase
      .from('member_last_visit')
      .select('visited_at, treatment_name, recommended_return_date')
      .eq('member_id', memberId)
      .maybeSingle(),
    supabase
      .from('visit_history')
      .select(
        'id, visited_at, price_paid, before_after_photo_url, treatment_types(name)',
      )
      .eq('member_id', memberId)
      .order('visited_at', { ascending: false }),
  ])

  const visitRows = (visitData ?? []) as unknown as {
    id: string
    visited_at: string
    price_paid: number
    before_after_photo_url: string | null
    treatment_types: { name: string } | null
  }[]

  return {
    lastVisit:
      (lastVisitData as MemberDetailData['lastVisit']) ?? null,
    visits: visitRows.map((v) => ({
      id: v.id,
      visited_at: v.visited_at,
      price_paid: v.price_paid,
      before_after_photo_url: v.before_after_photo_url,
      treatment_name: v.treatment_types?.name ?? '-',
    })),
  }
}
