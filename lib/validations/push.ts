import { z } from 'zod'

// [SECURITY-05] 푸시 구독 검증
export const subscriptionSchema = z.object({
  endpoint: z.string().url('유효하지 않은 endpoint'),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
})

export type SubscriptionInput = z.infer<typeof subscriptionSchema>
