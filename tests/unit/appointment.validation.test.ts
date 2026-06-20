import { describe, it, expect } from 'vitest'
import { appointmentSchema } from '@/lib/validations/appointment'

const UUID = '00000000-0000-0000-0000-000000000000'

describe('appointmentSchema', () => {
  const valid = {
    member_id: UUID,
    treatment_type_id: UUID,
    date: '2026-06-17',
    time: '14:30',
    memo: '',
  }

  it('유효한 입력을 통과시키고 memo 빈 값을 null로', () => {
    const result = appointmentSchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.memo).toBeNull()
  })

  it('잘못된 회원 UUID 거부', () => {
    expect(
      appointmentSchema.safeParse({ ...valid, member_id: 'abc' }).success,
    ).toBe(false)
  })

  it('영업시간 밖 슬롯 거부', () => {
    expect(appointmentSchema.safeParse({ ...valid, time: '09:00' }).success).toBe(
      false,
    )
  })

  it('비정렬 슬롯(10:15) 거부', () => {
    expect(appointmentSchema.safeParse({ ...valid, time: '10:15' }).success).toBe(
      false,
    )
  })

  it('잘못된 날짜 형식 거부', () => {
    expect(
      appointmentSchema.safeParse({ ...valid, date: '2026/06/17' }).success,
    ).toBe(false)
  })
})
