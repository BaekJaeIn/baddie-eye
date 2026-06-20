import { describe, it, expect } from 'vitest'
import { subscriptionSchema } from '@/lib/validations/push'

describe('subscriptionSchema', () => {
  const valid = {
    endpoint: 'https://fcm.googleapis.com/fcm/send/abc123',
    keys: { p256dh: 'BPxxx', auth: 'authtoken' },
  }

  it('유효한 구독 통과', () => {
    expect(subscriptionSchema.safeParse(valid).success).toBe(true)
  })

  it('잘못된 endpoint URL 거부', () => {
    expect(
      subscriptionSchema.safeParse({ ...valid, endpoint: 'not-url' }).success,
    ).toBe(false)
  })

  it('keys 누락 거부', () => {
    expect(
      subscriptionSchema.safeParse({ endpoint: valid.endpoint }).success,
    ).toBe(false)
  })

  it('빈 p256dh 거부', () => {
    expect(
      subscriptionSchema.safeParse({
        ...valid,
        keys: { p256dh: '', auth: 'x' },
      }).success,
    ).toBe(false)
  })
})
