// 월(YYYY-MM) 유틸 — 통계 기간

import { toDateStr } from '@/lib/booking/slots'

// 'YYYY-MM' 검증/폴백 (잘못되면 이번 달)
export function parseMonth(s?: string): string {
  if (s && /^\d{4}-\d{2}$/.test(s)) return s
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// 월 범위: 1일 00:00 ~ 다음 달 1일 00:00 (ISO, 로컬 기준 문자열)
export function monthRange(month: string): { start: string; end: string } {
  const [y, m] = month.split('-').map(Number)
  const start = new Date(y, m - 1, 1)
  const end = new Date(y, m, 1) // 다음 달 1일
  return {
    start: `${toDateStr(start)}T00:00:00`,
    end: `${toDateStr(end)}T00:00:00`,
  }
}

// 월 이동
export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// '2026년 6월'
export function formatMonth(month: string): string {
  const [y, m] = month.split('-').map(Number)
  return `${y}년 ${m}월`
}
