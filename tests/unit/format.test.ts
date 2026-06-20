import { describe, it, expect } from 'vitest'
import { normalizePhone, formatPhone, tierLabel } from '@/lib/format'

describe('normalizePhone', () => {
  it('하이픈과 공백을 제거한다', () => {
    expect(normalizePhone('010-1234-5678')).toBe('01012345678')
    expect(normalizePhone('010 1234 5678')).toBe('01012345678')
  })
})

describe('formatPhone', () => {
  it('11자리를 010-1234-5678로 포맷한다', () => {
    expect(formatPhone('01012345678')).toBe('010-1234-5678')
  })

  it('10자리를 02-123-4567로 포맷한다', () => {
    expect(formatPhone('0212345678')).toBe('021-234-5678')
  })

  it('이미 포맷된 입력도 처리한다', () => {
    expect(formatPhone('010-1234-5678')).toBe('010-1234-5678')
  })

  it('알 수 없는 길이는 원본 반환', () => {
    expect(formatPhone('123')).toBe('123')
  })
})

describe('tierLabel', () => {
  it('등급 코드를 한글로 변환한다', () => {
    expect(tierLabel('regular')).toBe('일반')
    expect(tierLabel('loyal')).toBe('단골')
    expect(tierLabel('vip')).toBe('VIP')
  })
})
