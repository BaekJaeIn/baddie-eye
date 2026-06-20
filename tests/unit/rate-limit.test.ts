import { describe, it, expect, beforeEach } from 'vitest'
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit'

describe('checkRateLimit', () => {
  const key = 'test-ip'

  beforeEach(() => {
    resetRateLimit(key)
  })

  it('한도 내 시도를 허용한다', () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(key).allowed).toBe(true)
    }
  })

  it('5회 초과 시 차단하고 retryAfter를 제공한다', () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key)
    }
    const result = checkRateLimit(key)
    expect(result.allowed).toBe(false)
    expect(result.retryAfterSec).toBeGreaterThan(0)
  })

  it('reset 후 다시 허용한다', () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key)
    }
    expect(checkRateLimit(key).allowed).toBe(false)
    resetRateLimit(key)
    expect(checkRateLimit(key).allowed).toBe(true)
  })

  it('서로 다른 키는 독립적으로 카운트한다', () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit('ip-a')
    }
    expect(checkRateLimit('ip-a').allowed).toBe(false)
    expect(checkRateLimit('ip-b').allowed).toBe(true)
    resetRateLimit('ip-a')
    resetRateLimit('ip-b')
  })
})
