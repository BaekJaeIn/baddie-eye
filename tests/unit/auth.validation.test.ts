import { describe, it, expect } from 'vitest'
import { loginSchema } from '@/lib/validations/auth'

describe('loginSchema', () => {
  it('유효한 이메일/비밀번호를 통과시킨다', () => {
    const result = loginSchema.safeParse({
      email: 'owner@baddie-eye.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('잘못된 이메일 형식을 거부한다', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('8자 미만 비밀번호를 거부한다', () => {
    const result = loginSchema.safeParse({
      email: 'owner@baddie-eye.com',
      password: 'short',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('8자')
    }
  })

  it('빈 이메일을 거부한다', () => {
    const result = loginSchema.safeParse({ email: '', password: 'password123' })
    expect(result.success).toBe(false)
  })

  it('비정상적으로 긴 비밀번호를 거부한다', () => {
    const result = loginSchema.safeParse({
      email: 'owner@baddie-eye.com',
      password: 'a'.repeat(129),
    })
    expect(result.success).toBe(false)
  })
})
