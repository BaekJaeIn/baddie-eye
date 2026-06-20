import { describe, it, expect } from 'vitest'
import { memberSchema } from '@/lib/validations/member'

describe('memberSchema', () => {
  const valid = {
    name: '김속눈',
    phone: '010-1234-5678',
    birthday: '',
    first_visit_at: '',
    allergy_note: '',
    membership_tier: 'regular',
    points: 0,
  }

  it('유효한 입력을 통과시키고 전화번호를 정규화한다', () => {
    const result = memberSchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.phone).toBe('01012345678')
      expect(result.data.birthday).toBeNull()
    }
  })

  it('이름이 비면 거부한다', () => {
    const result = memberSchema.safeParse({ ...valid, name: '' })
    expect(result.success).toBe(false)
  })

  it('잘못된 전화번호 자릿수를 거부한다', () => {
    const result = memberSchema.safeParse({ ...valid, phone: '12345' })
    expect(result.success).toBe(false)
  })

  it('잘못된 등급을 거부한다', () => {
    const result = memberSchema.safeParse({ ...valid, membership_tier: 'gold' })
    expect(result.success).toBe(false)
  })

  it('음수 포인트를 거부한다', () => {
    const result = memberSchema.safeParse({ ...valid, points: -5 })
    expect(result.success).toBe(false)
  })

  it('500자 초과 주의사항을 거부한다', () => {
    const result = memberSchema.safeParse({
      ...valid,
      allergy_note: 'a'.repeat(501),
    })
    expect(result.success).toBe(false)
  })

  it('잘못된 날짜 형식을 거부한다', () => {
    const result = memberSchema.safeParse({ ...valid, birthday: '2020/01/01' })
    expect(result.success).toBe(false)
  })
})
