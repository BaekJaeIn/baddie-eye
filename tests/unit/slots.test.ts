import { describe, it, expect } from 'vitest'
import {
  generateSlots,
  isValidSlot,
  getWeekStart,
  getWeekDays,
  shiftWeek,
  combineDateTime,
  extractTime,
} from '@/lib/booking/slots'

describe('generateSlots', () => {
  it('10:00부터 19:30까지 30분 단위 20개 슬롯', () => {
    const slots = generateSlots()
    expect(slots).toHaveLength(20)
    expect(slots[0]).toBe('10:00')
    expect(slots[1]).toBe('10:30')
    expect(slots.at(-1)).toBe('19:30')
  })
})

describe('isValidSlot', () => {
  it('유효한 슬롯을 인식한다', () => {
    expect(isValidSlot('10:00')).toBe(true)
    expect(isValidSlot('19:30')).toBe(true)
  })
  it('영업시간 밖/비정렬 슬롯을 거부한다', () => {
    expect(isValidSlot('09:30')).toBe(false)
    expect(isValidSlot('20:00')).toBe(false)
    expect(isValidSlot('10:15')).toBe(false)
  })
})

describe('getWeekStart', () => {
  it('주중 날짜의 월요일을 반환한다', () => {
    // 2026-06-17은 수요일 → 월요일은 2026-06-15
    expect(getWeekStart(new Date(2026, 5, 17))).toBe('2026-06-15')
  })
  it('일요일은 그 주 월요일(이전)을 반환한다', () => {
    // 2026-06-21은 일요일 → 월요일 2026-06-15
    expect(getWeekStart(new Date(2026, 5, 21))).toBe('2026-06-15')
  })
})

describe('getWeekDays', () => {
  it('월요일부터 7일을 반환한다', () => {
    const days = getWeekDays('2026-06-15')
    expect(days).toHaveLength(7)
    expect(days[0]).toBe('2026-06-15')
    expect(days[6]).toBe('2026-06-21')
  })
})

describe('shiftWeek', () => {
  it('주 단위로 이동한다', () => {
    expect(shiftWeek('2026-06-15', 1)).toBe('2026-06-22')
    expect(shiftWeek('2026-06-15', -1)).toBe('2026-06-08')
  })
})

describe('combineDateTime / extractTime', () => {
  it('날짜와 시간을 KST(+09:00) 기준으로 결합하고 다시 추출한다', () => {
    const iso = combineDateTime('2026-06-17', '14:30')
    expect(iso).toBe('2026-06-17T14:30:00+09:00')
    // 서버 타임존과 무관하게 KST로 14:30 추출
    expect(extractTime(iso)).toBe('14:30')
  })

  it('UTC 저장값(+00:00)도 KST로 변환해 추출한다', () => {
    // UTC 01:00 = KST 10:00
    expect(extractTime('2026-06-20T01:00:00+00:00')).toBe('10:00')
  })
})
