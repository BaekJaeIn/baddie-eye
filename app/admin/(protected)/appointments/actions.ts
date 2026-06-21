'use server'

import { revalidatePath } from 'next/cache'
import * as Sentry from '@sentry/nextjs'
import { createClient } from '@/lib/supabase/server'
import { appointmentSchema } from '@/lib/validations/appointment'
import {
  combineDateTime,
  extractTime,
  extractKstDate,
} from '@/lib/booking/slots'
import { notifyUser } from '@/lib/notify'
import type { AppointmentStatus } from '@/types/database'

export interface AppointmentActionState {
  error?: string
  ok?: boolean
}

const GENERIC_ERROR = '저장 중 오류가 발생했습니다. 다시 시도해주세요.'
const SLOT_TAKEN_ERROR = '이미 예약된 시간입니다'

function parseForm(formData: FormData) {
  return appointmentSchema.safeParse({
    member_id: formData.get('member_id'),
    treatment_type_id: formData.get('treatment_type_id'),
    date: formData.get('date'),
    time: formData.get('time'),
    memo: formData.get('memo'),
  })
}

// 시술 소요시간 조회 (없으면 30분)
async function getDuration(
  supabase: ReturnType<typeof createClient>,
  treatmentTypeId: string,
): Promise<number> {
  const { data } = await supabase
    .from('treatment_types')
    .select('duration_min')
    .eq('id', treatmentTypeId)
    .single()
  return (data as { duration_min: number } | null)?.duration_min ?? 30
}

interface OverlapRow {
  id: string
  scheduled_at: string
  treatment_types: { duration_min: number } | null
}

// [BR-APT-03] 시간대 겹침 검사 — 새 예약 [start, start+duration)이
// 취소되지 않은 기존 예약 [s, s+dur)와 겹치는지. (소요시간 고려)
// excludeId: 수정 중인 예약 자신은 제외 [BR-APT-08]
async function hasOverlap(
  supabase: ReturnType<typeof createClient>,
  scheduledAt: string,
  durationMin: number,
  excludeId?: string,
): Promise<boolean> {
  const start = new Date(scheduledAt).getTime()
  const end = start + durationMin * 60_000

  let query = supabase
    .from('appointments')
    .select('id, scheduled_at, treatment_types(duration_min)')
    .neq('status', 'cancelled')
  if (excludeId) query = query.neq('id', excludeId)
  const { data } = await query

  for (const a of (data ?? []) as unknown as OverlapRow[]) {
    const s = new Date(a.scheduled_at).getTime()
    const e = s + (a.treatment_types?.duration_min ?? 30) * 60_000
    if (s < end && e > start) return true // 겹침
  }
  return false
}

export async function createAppointmentAction(
  _prev: AppointmentActionState,
  formData: FormData,
): Promise<AppointmentActionState> {
  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '입력값을 확인해주세요' }
  }

  const { member_id, treatment_type_id, date, time, memo } = parsed.data
  const scheduled_at = combineDateTime(date, time)

  const supabase = createClient()
  try {
    const dur = await getDuration(supabase, treatment_type_id)
    if (await hasOverlap(supabase, scheduled_at, dur)) {
      return { error: SLOT_TAKEN_ERROR }
    }
    const { error } = await supabase.from('appointments').insert({
      member_id,
      treatment_type_id,
      scheduled_at,
      memo,
      status: 'pending',
    })
    if (error) {
      Sentry.captureException(error)
      return { error: GENERIC_ERROR }
    }
  } catch (err) {
    Sentry.captureException(err)
    return { error: GENERIC_ERROR }
  }

  revalidatePath('/admin/appointments')
  return { ok: true }
}

export async function updateAppointmentAction(
  id: string,
  _prev: AppointmentActionState,
  formData: FormData,
): Promise<AppointmentActionState> {
  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '입력값을 확인해주세요' }
  }

  const { member_id, treatment_type_id, date, time, memo } = parsed.data
  const scheduled_at = combineDateTime(date, time)

  const supabase = createClient()
  try {
    const dur = await getDuration(supabase, treatment_type_id)
    if (await hasOverlap(supabase, scheduled_at, dur, id)) {
      return { error: SLOT_TAKEN_ERROR }
    }
    const { error } = await supabase
      .from('appointments')
      .update({ member_id, treatment_type_id, scheduled_at, memo })
      .eq('id', id)
      .eq('status', 'pending') // [BR-APT-07] pending만 변경 가능
    if (error) {
      Sentry.captureException(error)
      return { error: GENERIC_ERROR }
    }
  } catch (err) {
    Sentry.captureException(err)
    return { error: GENERIC_ERROR }
  }

  revalidatePath('/admin/appointments')
  revalidatePath(`/admin/appointments/${id}`)
  return { ok: true }
}

// [BR-APT-05] 상태 전이: pending → completed/cancelled
export async function updateAppointmentStatusAction(
  id: string,
  status: Extract<AppointmentStatus, 'completed' | 'cancelled'>,
): Promise<void> {
  const supabase = createClient()
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .eq('status', 'pending') // 종료 상태는 재변경 불가 [BR-APT-06]
    if (error) {
      Sentry.captureException(error)
    } else if (status === 'completed') {
      // [BR-VH-01~06] 완료 시 시술 내역 자동 생성
      await createVisitFromAppointment(supabase, id)
    }
  } catch (err) {
    Sentry.captureException(err)
  }

  revalidatePath('/admin/appointments')
  revalidatePath(`/admin/appointments/${id}`)
}

// [BR-AP-01] 고객 신청 승인: requested → pending
export async function approveAppointmentAction(id: string): Promise<void> {
  const supabase = createClient()
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'pending' })
      .eq('id', id)
      .eq('status', 'requested')
    if (error) {
      Sentry.captureException(error)
    } else {
      // 회원에게 예약 확정 알림 (Web Push). 실패해도 무시.
      await notifyMemberApproved(supabase, id)
    }
  } catch (err) {
    Sentry.captureException(err)
  }
  revalidatePath('/admin/appointments')
  revalidatePath(`/admin/appointments/${id}`)
}

// 확정된 예약의 회원에게 알림 발송
async function notifyMemberApproved(
  supabase: ReturnType<typeof createClient>,
  appointmentId: string,
): Promise<void> {
  try {
    const { data } = await supabase
      .from('appointments')
      .select('scheduled_at, members(user_id), treatment_types(name)')
      .eq('id', appointmentId)
      .single()
    if (!data) return
    const row = data as unknown as {
      scheduled_at: string
      members: { user_id: string | null } | null
      treatment_types: { name: string } | null
    }
    const userId = row.members?.user_id
    if (!userId) return
    const treatmentName = row.treatment_types?.name ?? '시술'
    await notifyUser(userId, {
      title: '예약이 확정되었어요',
      body: `${extractKstDate(row.scheduled_at)} ${extractTime(
        row.scheduled_at,
      )} · ${treatmentName} 예약이 확정되었습니다.`,
      url: '/me/appointments',
    })
  } catch {
    // 알림 실패 무시
  }
}

// [BR-AP-01] 고객 신청 거절: requested → cancelled
export async function rejectAppointmentAction(id: string): Promise<void> {
  const supabase = createClient()
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .eq('status', 'requested')
    if (error) Sentry.captureException(error)
  } catch (err) {
    Sentry.captureException(err)
  }
  revalidatePath('/admin/appointments')
  revalidatePath(`/admin/appointments/${id}`)
}

// 완료된 예약으로부터 시술 내역 생성 [BR-VH-01~06]
async function createVisitFromAppointment(
  supabase: ReturnType<typeof createClient>,
  appointmentId: string,
): Promise<void> {
  // 예약 + 시술 기본가격 조회
  const { data: apt } = await supabase
    .from('appointments')
    .select('member_id, treatment_type_id, scheduled_at, treatment_types(base_price)')
    .eq('id', appointmentId)
    .single()

  if (!apt) return
  const row = apt as unknown as {
    member_id: string
    treatment_type_id: string
    scheduled_at: string
    treatment_types: { base_price: number } | null
  }

  // insert — appointment_id 유니크 인덱스로 중복 시 23505 (무시) [BR-VH-05]
  const { error } = await supabase.from('visit_history').insert({
    member_id: row.member_id,
    appointment_id: appointmentId,
    treatment_type_id: row.treatment_type_id,
    visited_at: row.scheduled_at,
    price_paid: row.treatment_types?.base_price ?? 0, // [BR-VH-03]
    before_after_photo_url: null, // [BR-VH-04]
  })

  // 중복(23505)은 정상 — 이미 생성됨. 그 외 에러만 기록 [BR-VH-06]
  if (error && error.code !== '23505') {
    Sentry.captureException(error)
  }
}
