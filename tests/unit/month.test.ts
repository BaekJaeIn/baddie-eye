import { describe, it, expect } from 'vitest'
import {
  parseMonth,
  monthRange,
  shiftMonth,
  formatMonth,
} from '@/lib/stats/month'

describe('parseMonth', () => {
  it('유효한 YYYY-MM 통과', () => {
    expect(parseMonth('2026-06')).toBe('2026-06')
  })
  it('잘못된 입력은 이번 달로 폴백', () => {
    const r = parseMonth('bad')
    expect(r).toMatch(/^\d{4}-\d{2}$/)
  })
})

describe('monthRange', () => {
  it('월 1일 ~ 다음 달 1일', () => {
    const { start, end } = monthRange('2026-06')
    expect(start).toBe('2026-06-01T00:00:00')
    expect(end).toBe('2026-07-01T00:00:00')
  })
  it('12월은 다음 해 1월로', () => {
    const { end } = monthRange('2026-12')
    expect(end).toBe('2027-01-01T00:00:00')
  })
})

describe('shiftMonth', () => {
  it('이전/다음 달', () => {
    expect(shiftMonth('2026-06', 1)).toBe('2026-07')
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
  })
})

describe('formatMonth', () => {
  it('한글 포맷', () => {
    expect(formatMonth('2026-06')).toBe('2026년 6월')
  })
})
