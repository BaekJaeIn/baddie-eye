// 예약 슬롯 / 주간 계산 유틸 (단일 슬롯, 30분 단위)

export const BUSINESS_START_HOUR = 10 // 10:00
export const BUSINESS_END_HOUR = 20 // 20:00 (마지막 슬롯 19:30)
export const SLOT_MINUTES = 30
export const MAX_BOOKING_DAYS = 84 // 고객 예약 가능 범위 (12주) [Q2]

// 영업시간 내 30분 슬롯 목록 ('10:00' ~ '19:30')
export function generateSlots(): string[] {
  const slots: string[] = []
  for (let h = BUSINESS_START_HOUR; h < BUSINESS_END_HOUR; h++) {
    for (let m = 0; m < 60; m += SLOT_MINUTES) {
      const hh = String(h).padStart(2, '0')
      const mm = String(m).padStart(2, '0')
      slots.push(`${hh}:${mm}`)
    }
  }
  return slots
}

// 주어진 'HH:mm'이 유효한 슬롯인지
export function isValidSlot(time: string): boolean {
  return generateSlots().includes(time)
}

// YYYY-MM-DD 로컬 날짜 문자열
export function toDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// 해당 날짜가 속한 주의 월요일 (YYYY-MM-DD)
export function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getDay() // 0=일 ~ 6=토
  const diff = day === 0 ? -6 : 1 - day // 월요일까지
  d.setDate(d.getDate() + diff)
  return toDateStr(d)
}

// 주 시작(월) 기준 7일 (월~일) YYYY-MM-DD 배열
export function getWeekDays(weekStart: string): string[] {
  const [y, m, d] = weekStart.split('-').map(Number)
  const base = new Date(y, m - 1, d)
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(base)
    day.setDate(base.getDate() + i)
    return toDateStr(day)
  })
}

// 주 이동 (offset 주 단위)
export function shiftWeek(weekStart: string, offset: number): string {
  const [y, m, d] = weekStart.split('-').map(Number)
  const base = new Date(y, m - 1, d)
  base.setDate(base.getDate() + offset * 7)
  return toDateStr(base)
}

// 한국 시간대 고정 — 서버(UTC)/브라우저 로컬에 무관하게 일관 처리
const KST_TZ = 'Asia/Seoul'

// 날짜 + 시간을 timestamptz용 ISO 문자열로.
// KST(+09:00)를 명시해 timestamptz에 올바른 절대시각으로 저장한다.
export function combineDateTime(date: string, time: string): string {
  return `${date}T${time}:00+09:00`
}

// ISO/timestamptz에서 KST 기준 'HH:mm' 추출
export function extractTime(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: KST_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(iso))
  const hh = parts.find((p) => p.type === 'hour')!.value
  const mm = parts.find((p) => p.type === 'minute')!.value
  return `${hh === '24' ? '00' : hh}:${mm}`
}

// ISO/timestamptz에서 KST 기준 'YYYY-MM-DD' 추출 (캘린더 날짜 매칭용)
export function extractKstDate(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: KST_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(iso))
  const get = (t: string) => parts.find((p) => p.type === t)!.value
  return `${get('year')}-${get('month')}-${get('day')}`
}

// 요일 한글 라벨
export const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']

// 예약 가능 날짜 범위 (오늘 ~ 오늘+MAX_BOOKING_DAYS) [BR-BK-04]
export function isWithinBookingWindow(
  date: string,
  today: Date = new Date(),
): boolean {
  const [y, m, d] = date.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const max = new Date(base)
  max.setDate(base.getDate() + MAX_BOOKING_DAYS)
  return target >= base && target <= max
}

// date input용 min/max (YYYY-MM-DD)
export function bookingDateBounds(today: Date = new Date()): {
  min: string
  max: string
} {
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const max = new Date(base)
  max.setDate(base.getDate() + MAX_BOOKING_DAYS)
  return { min: toDateStr(base), max: toDateStr(max) }
}
