'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'
import { createClient } from '@/lib/supabase/server'
import { memberBookingSchema } from '@/lib/validations/booking'
import { combineDateTime, isWithinBookingWindow } from '@/lib/booking/slots'

export interface MemberApptActionState {
  error?: string
}

const GENERIC_ERROR = '처리 중 오류가 발생했습니다. 다시 시도해주세요.'
const TOO_LATE = '예약 24시간 전까지만 변경/취소할 수 있습니다.'
const SLOT_TAKEN = '이미 예약된 시간입니다.'

// 24시간 전 + 변경 가능 상태 확인 [BR-CX-02,03]
function canModify(scheduledAt: string, status: string): string | null {
  if (status !== 'requested' && status !== 'pending') {
    return '변경할 수 없는 예약입니다.'
  }
  const diffMs = new Date(scheduledAt).getTime() - Date.now()
  if (diffMs < 24 * 60 * 60 * 1000) return TOO_LATE
  return null
}

export async function cancelAppointmentAction(id: string): Promise<void> {
  const supabase = createClient()
  try {
    const { data } = await supabase
      .from('appointments')
      .select('scheduled_at, status')
      .eq('id', id)
      .single()
    if (data && !canModify(data.scheduled_at, data.status)) {
      await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id)
    }
  } catch (err) {
    Sentry.captureException(err)
  }
  revalidatePath('/me/appointments')
  redirect('/me/appointments')
}

export async function updateMemberAppointmentAction(
  id: string,
  _prev: MemberApptActionState,
  formData: FormData,
): Promise<MemberApptActionState> {
  const supabase = createClient()

  // 기존 예약 확인 (RLS로 자기 것만)
  const { data: existing } = await supabase
    .from('appointments')
    .select('scheduled_at, status')
    .eq('id', id)
    .single()
  if (!existing) return { error: '예약을 찾을 수 없습니다.' }

  const blocker = canModify(existing.scheduled_at, existing.status)
  if (blocker) return { error: blocker }

  const parsed = memberBookingSchema.safeParse({
    treatment_type_id: formData.get('treatment_type_id'),
    date: formData.get('date'),
    time: formData.get('time'),
    memo: formData.get('memo'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '입력값을 확인해주세요' }
  }
  if (!isWithinBookingWindow(parsed.data.date)) {
    return { error: '오늘부터 12주 이내 날짜만 가능합니다.' }
  }

  const scheduledAt = combineDateTime(parsed.data.date, parsed.data.time)

  try {
    // 슬롯 충돌 검사 (자기 자신 제외) [BR-CX-06]
    const { data: conflict } = await supabase
      .from('appointments')
      .select('id')
      .eq('scheduled_at', scheduledAt)
      .neq('status', 'cancelled')
      .neq('id', id)
    if ((conflict?.length ?? 0) > 0) {
      return { error: SLOT_TAKEN }
    }

    const { error } = await supabase
      .from('appointments')
      .update({
        treatment_type_id: parsed.data.treatment_type_id,
        scheduled_at: scheduledAt,
        memo: parsed.data.memo,
      })
      .eq('id', id)
    if (error) {
      Sentry.captureException(error)
      return { error: GENERIC_ERROR }
    }
  } catch (err) {
    Sentry.captureException(err)
    return { error: GENERIC_ERROR }
  }

  revalidatePath('/me/appointments')
  redirect('/me/appointments')
}
