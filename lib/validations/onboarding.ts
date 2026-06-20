import { z } from 'zod'
import { normalizePhone } from '@/lib/format'

// [SECURITY-05, BR-OB-01] 온보딩 전화번호 검증
export const onboardingSchema = z.object({
  phone: z
    .string()
    .trim()
    .transform(normalizePhone)
    .refine((v) => v.length === 10 || v.length === 11, {
      message: '올바른 연락처를 입력해주세요 (10~11자리)',
    }),
})

export type OnboardingInput = z.infer<typeof onboardingSchema>
