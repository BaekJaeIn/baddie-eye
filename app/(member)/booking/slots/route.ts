import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  generateSlots,
  combineDateTime,
  extractTime,
  extractKstDate,
  isWithinBookingWindow,
} from '@/lib/booking/slots'

// 날짜별 가용 슬롯 조회. 점유 슬롯(get_taken_slots) + 과거 슬롯 제외.
export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date')
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'invalid date' }, { status: 400 })
  }
  if (!isWithinBookingWindow(date)) {
    return NextResponse.json({ slots: [] })
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

  const slots = generateSlots().filter((t) => {
    if (taken.has(t)) return false
    if (isToday && t <= nowTime) return false // 오늘 지난 시간 제외
    return true
  })

  return NextResponse.json({ slots })
}
