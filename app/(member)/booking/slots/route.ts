import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  generateSlots,
  combineDateTime,
  extractTime,
  extractKstDate,
  isWithinBookingWindow,
} from '@/lib/booking/slots'

// 날짜별 전체 슬롯 + 가용 여부 조회.
// 점유 슬롯(소요시간 반영)·과거 슬롯은 available:false로 표시(숨기지 않음).
export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date')
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'invalid date' }, { status: 400 })
  }
  if (!isWithinBookingWindow(date)) {
    // 범위 밖 날짜 — 전체 비활성
    return NextResponse.json({
      slots: generateSlots().map((time) => ({ time, available: false })),
    })
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // KST 기준 그 날 00:00 ~ 23:59:59 (combineDateTime이 +09:00 부여)
  const from = combineDateTime(date, '00:00')
  const to = `${date}T23:59:59+09:00`

  const { data, error } = await supabase.rpc('get_taken_slots', {
    p_from: from,
    p_to: to,
  })
  if (error) {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }

  const taken = new Set(
    ((data ?? []) as { slot: string }[]).map((r) => extractTime(r.slot)),
  )

  // KST 기준 현재 날짜/시각 (서버 타임존 무관)
  const nowIso = new Date().toISOString()
  const isToday = date === extractKstDate(nowIso)
  const nowTime = extractTime(nowIso)

  const slots = generateSlots().map((t) => ({
    time: t,
    // 점유(소요시간 반영)도 아니고 지난 시간도 아니면 가용
    available: !taken.has(t) && !(isToday && t <= nowTime),
  }))

  return NextResponse.json({ slots })
}
