import { describe, it, expect } from 'vitest'
import {
  isWithinBookingWindow,
  bookingDateBounds,
  MAX_BOOKING_DAYS,
} from '@/lib/booking/slots'

const TODAY = new Date(2026, 5, 19) // 2026-06-19

describe('isWithinBookingWindow', () => {
  it('오늘은 가능', () => {
    expect(isWithinBookingWindow('2026-06-19', TODAY)).toBe(true)
  })

  it('어제는 불가', () => {
    expect(isWithinBookingWindow('2026-06-18', TODAY)).toBe(false)
  })

  it('84일째는 가능, 85일째는 불가', () => {
    // 2026-06-19 + 84일 = 2026-09-11
    expect(isWithinBookingWindow('2026-09-11', TODAY)).toBe(true)
    expect(isWithinBookingWindow('2026-09-12', TODAY)).toBe(false)
  })
})

describe('bookingDateBounds', () => {
  it('min은 오늘, max는 +84일', () => {
    const { min, max } = bookingDateBounds(TODAY)
    expect(min).toBe('2026-06-19')
    expect(max).toBe('2026-09-11')
  })

  it('MAX_BOOKING_DAYS는 84', () => {
    expect(MAX_BOOKING_DAYS).toBe(84)
  })
})
