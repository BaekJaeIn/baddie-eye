import { describe, it, expect } from 'vitest'
import { treatmentSchema } from '@/lib/validations/treatment'

describe('treatmentSchema', () => {
  const valid = {
    name: '자연눈썹 1set',
    duration_min: 90,
    base_price: 50000,
    recommended_interval_days: 21,
  }

  it('유효한 입력을 통과시킨다', () => {
    expect(treatmentSchema.safeParse(valid).success).toBe(true)
  })

  it('권장주기 빈 값은 null로 처리한다', () => {
    const result = treatmentSchema.safeParse({
      ...valid,
      recommended_interval_days: '',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.recommended_interval_days).toBeNull()
    }
  })

  it('이름 없으면 거부', () => {
    expect(treatmentSchema.safeParse({ ...valid, name: '' }).success).toBe(false)
  })

  it('소요시간 0 이하 거부', () => {
    expect(
      treatmentSchema.safeParse({ ...valid, duration_min: 0 }).success,
    ).toBe(false)
  })

  it('음수 가격 거부', () => {
    expect(treatmentSchema.safeParse({ ...valid, base_price: -1 }).success).toBe(
      false,
    )
  })
})
