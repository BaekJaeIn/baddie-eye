import { z } from 'zod'
import { normalizePhone } from '@/lib/format'

// [SECURITY-05] 회원 입력 검증 — 서버 신뢰 경계.
// 빈 문자열 선택 필드는 null로 변환.
const emptyToNull = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? null : v

const dateString = z
  .preprocess(
    emptyToNull,
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다')
      .nullable(),
  )
  .nullable()

export const memberSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, '이름을 입력해주세요')
    .max(50, '이름은 50자 이내로 입력해주세요'),
  phone: z
    .string()
    .trim()
    .transform(normalizePhone)
    .refine((v) => v.length === 10 || v.length === 11, {
      message: '올바른 연락처를 입력해주세요 (10~11자리)',
    }),
  birthday: dateString,
  first_visit_at: dateString,
  allergy_note: z.preprocess(
    emptyToNull,
    z
      .string()
      .max(500, '주의사항은 500자 이내로 입력해주세요')
      .nullable(),
  ),
  membership_tier: z.enum(['regular', 'loyal', 'vip']).default('regular'),
  points: z.coerce
    .number()
    .int('포인트는 정수여야 합니다')
    .min(0, '포인트는 0 이상이어야 합니다')
    .default(0),
})

export type MemberInput = z.infer<typeof memberSchema>
