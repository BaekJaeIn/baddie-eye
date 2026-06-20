import { describe, it, expect } from 'vitest'
import { visitEditSchema } from '@/lib/validations/visit'

describe('visitEditSchema', () => {
  const valid = {
    price_paid: 50000,
    visited_at: '2026-06-17T14:30',
    before_after_photo_url: '',
  }

  it('유효한 입력 통과, 빈 URL은 null', () => {
    const result = visitEditSchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.before_after_photo_url).toBeNull()
    }
  })

  it('유효한 사진 URL 통과', () => {
    const result = visitEditSchema.safeParse({
      ...valid,
      before_after_photo_url: 'https://example.supabase.co/storage/x.jpg',
    })
    expect(result.success).toBe(true)
  })

  it('음수 결제금액 거부', () => {
    expect(
      visitEditSchema.safeParse({ ...valid, price_paid: -1 }).success,
    ).toBe(false)
  })

  it('잘못된 URL 거부', () => {
    expect(
      visitEditSchema.safeParse({ ...valid, before_after_photo_url: 'not-url' })
        .success,
    ).toBe(false)
  })

  it('빈 방문일시 거부', () => {
    expect(visitEditSchema.safeParse({ ...valid, visited_at: '' }).success).toBe(
      false,
    )
  })
})
