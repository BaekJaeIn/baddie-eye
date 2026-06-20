import { describe, it, expect } from 'vitest'
import { getReturnInfo, formatDday } from '@/lib/visit/recommend'

const TODAY = new Date(2026, 5, 19) // 2026-06-19

describe('getReturnInfo', () => {
  it('권장일 없으면 none', () => {
    expect(getReturnInfo(null, TODAY)).toEqual({ status: 'none', dday: null })
  })

  it('과거 권장일은 overdue', () => {
    const info = getReturnInfo('2026-06-10', TODAY)
    expect(info.status).toBe('overdue')
    expect(info.dday).toBe(-9)
  })

  it('오늘은 soon (D-day 0)', () => {
    const info = getReturnInfo('2026-06-19', TODAY)
    expect(info.status).toBe('soon')
    expect(info.dday).toBe(0)
  })

  it('7일 이내는 soon', () => {
    expect(getReturnInfo('2026-06-26', TODAY).status).toBe('soon')
  })

  it('8일 이후는 later', () => {
    expect(getReturnInfo('2026-06-27', TODAY).status).toBe('later')
  })
})

describe('formatDday', () => {
  it('D-day, 경과, 남은 일수를 포맷', () => {
    expect(formatDday(0)).toBe('D-day')
    expect(formatDday(-9)).toBe('9일 경과')
    expect(formatDday(7)).toBe('D-7')
  })
})
