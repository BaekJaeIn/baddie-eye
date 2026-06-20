import { NextResponse, type NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPush, type PushPayload } from '@/lib/push/web-push'
import { extractTime, extractKstDate, toDateStr } from '@/lib/booking/slots'

export const dynamic = 'force-dynamic'

interface ReminderRow {
  id: string
  scheduled_at: string
  member_id: string
  members: { user_id: string | null } | null
  treatment_types: { name: string } | null
}

interface SubRow {
  id: string
  endpoint: string
  p256dh: string
  auth: string
}

// [Q1=B, Q3=A] 매시간 Cron — 24시간 후 확정 예약에 리마인더 발송
export async function GET(request: NextRequest) {
  // [BR-CR-01,02] 시크릿 검증
  const auth = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // [Hobby 플랜] 하루 1회(매일 KST 오전 9시) 실행 → "내일(KST)" 예약 전체에 발송.
  // KST 내일 00:00 ~ 모레 00:00 범위.
  const nowKstDate = extractKstDate(new Date().toISOString()) // 오늘(KST) YYYY-MM-DD
  const [y, m, d] = nowKstDate.split('-').map(Number)
  const tomorrow = toDateStr(new Date(y, m - 1, d + 1))
  const dayAfter = toDateStr(new Date(y, m - 1, d + 2))
  const from = `${tomorrow}T00:00:00+09:00`
  const to = `${dayAfter}T00:00:00+09:00`

  // [BR-RM-01,02] 대상 예약 (내일 확정 예약, 미발송)
  const { data, error } = await supabase
    .from('appointments')
    .select(
      'id, scheduled_at, member_id, members(user_id), treatment_types(name)',
    )
    .eq('status', 'pending')
    .is('reminder_sent_at', null)
    .gte('scheduled_at', from)
    .lt('scheduled_at', to)

  if (error) {
    Sentry.captureException(error)
    return NextResponse.json({ error: 'query failed' }, { status: 500 })
  }

  const rows = (data ?? []) as unknown as ReminderRow[]
  let sent = 0
  let failed = 0

  for (const appt of rows) {
    const userId = appt.members?.user_id
    if (!userId) continue

    const { data: subData } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('user_id', userId)
    const subs = (subData ?? []) as SubRow[]
    if (subs.length === 0) continue

    const payload: PushPayload = {
      title: '예약 리마인더',
      body: `내일 ${extractTime(appt.scheduled_at)} ${
        appt.treatment_types?.name ?? '시술'
      } 예약이 있어요`,
      url: '/me/appointments',
    }

    let anySent = false
    for (const sub of subs) {
      const result = await sendPush(sub, payload)
      if (result.ok) {
        anySent = true
      } else if (result.gone) {
        // [BR-RM-05] 만료 구독 제거
        await supabase.from('push_subscriptions').delete().eq('id', sub.id)
      } else {
        failed++
      }
    }

    // [BR-RM-03] 성공 시에만 기록 (재시도 여지)
    if (anySent) {
      await supabase
        .from('appointments')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('id', appt.id)
      sent++
    }
  }

  return NextResponse.json({ sent, failed, scanned: rows.length })
}
