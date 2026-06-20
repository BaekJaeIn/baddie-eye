import { describe, it, expect } from 'vitest'
import { memberBookingSchema } from '@/lib/validations/booking'

const UUID = '00000000-0000-0000-0000-000000000000'

describe('memberBookingSchema', () => {
  const valid = {
    treatment_type_id: UUID,
    date: '2026-07-01',
    time: '14:30',
    memo: '',
  }

  it('유효 입력 통과, memo 빈값 null', () => {
    const result = memberBookingSchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.memo).toBeNull()
  })

  it('시술 미선택(잘못된 uuid) 거부', () => {
    expect(
      memberBookingSchema.safeParse({ ...valid, treatment_type_id: 'x' })
        .success,
    ).toBe(false)
  })

  it('영업시간 밖 슬롯 거부', () => {
    expect(memberBookingSchema.safeParse({ ...valid, time: '09:00' }).success).toBe(
      false,
    )
  })

  it('잘못된 날짜 형식 거부', () => {
    expect(
      memberBookingSchema.safeParse({ ...valid, date: '2026/07/01' }).success,
    ).toBe(false)
  })
})
