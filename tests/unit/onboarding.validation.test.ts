import { describe, it, expect } from 'vitest'
import { onboardingSchema } from '@/lib/validations/onboarding'

describe('onboardingSchema', () => {
  it('유효한 전화번호를 정규화하여 통과', () => {
    const result = onboardingSchema.safeParse({ phone: '010-1234-5678' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.phone).toBe('01012345678')
  })

  it('공백 포함 번호도 정규화', () => {
    const result = onboardingSchema.safeParse({ phone: '010 1234 5678' })
    expect(result.success).toBe(true)
  })

  it('자릿수 부족 거부', () => {
    expect(onboardingSchema.safeParse({ phone: '12345' }).success).toBe(false)
  })

  it('빈 값 거부', () => {
    expect(onboardingSchema.safeParse({ phone: '' }).success).toBe(false)
  })
})
