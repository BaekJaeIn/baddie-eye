'use server'

import { redirect } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'
import { createClient } from '@/lib/supabase/server'
import { memberBookingSchema } from '@/lib/validations/booking'
import { combineDateTime, isWithinBookingWindow } from '@/lib/booking/slots'
import { notifyOwners } from '@/lib/notify'

export interface BookingActionState {
  error?: string
}

const ERROR_MAP: Record<string, string> = {
  SLOT_TAKEN: '이미 예약된 시간입니다. 다른 시간을 선택해주세요.',
  PAST_TIME: '지난 시간은 예약할 수 없습니다.',
  TOO_FAR: '예약은 12주 이내만 가능합니다.',
  NOT_MEMBER: '회원 연결이 필요합니다.',
  NOT_AUTHENTICATED: '로그인이 필요합니다.',
}
const GENERIC_ERROR = '예약 신청 중 오류가 발생했습니다. 다시 시도해주세요.'

export async function requestAppointmentAction(
  _prev: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const parsed = memberBookingSchema.safeParse({
    treatment_type_id: formData.get('treatment_type_id'),
    date: formData.get('date'),
    time: formData.get('time'),
    memo: formData.get('memo'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '입력값을 확인해주세요' }
  }

  // 예약 가능 범위 (앱 레벨 1차, 함수에서 2차 검증)
  if (!isWithinBookingWindow(parsed.data.date)) {
    return { error: '오늘부터 12주 이내 날짜만 예약할 수 있습니다.' }
  }

  const scheduledAt = combineDateTime(parsed.data.date, parsed.data.time)
  const supabase = createClient()
  try {
    const { error } = await supabase.rpc('request_appointment', {
      p_treatment_type_id: parsed.data.treatment_type_id,
      p_scheduled_at: scheduledAt,
      p_memo: parsed.data.memo,
    })
    if (error) {
      const key = Object.keys(ERROR_MAP).find((k) => error.message.includes(k))
      if (key) return { error: ERROR_MAP[key] }
      Sentry.captureException(error)
      return { error: GENERIC_ERROR }
    }
  } catch (err) {
    Sentry.captureException(err)
    return { error: GENERIC_ERROR }
  }

  // 원장에게 새 예약 신청 알림 (Web Push). 실패해도 본 흐름에 영향 없음.
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const [memberRes, treatmentRes] = await Promise.all([
      supabase
        .from('members')
        .select('name')
        .eq('user_id', user?.id ?? '')
        .maybeSingle(),
      supabase
        .from('treatment_types')
        .select('name')
        .eq('id', parsed.data.treatment_type_id)
        .maybeSingle(),
    ])
    const memberName = (memberRes.data as { name: string } | null)?.name ?? '회원'
    const treatmentName =
      (treatmentRes.data as { name: string } | null)?.name ?? '시술'
    await notifyOwners({
      title: '새 예약 신청',
      body: `${memberName}님 · ${treatmentName} · ${parsed.data.date} ${parsed.data.time}`,
      url: '/admin/appointments',
    })
  } catch {
    // 알림 실패 무시
  }

  redirect('/me/appointments')
}
