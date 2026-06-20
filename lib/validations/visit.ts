import { z } from 'zod'

// [SECURITY-05] 시술 내역 편집 검증
export const visitEditSchema = z.object({
  price_paid: z.coerce
    .number()
    .int('결제금액은 정수여야 합니다')
    .min(0, '결제금액은 0 이상이어야 합니다'),
  visited_at: z
    .string()
    .min(1, '방문 일시를 입력해주세요'),
  before_after_photo_url: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? null : v),
    z.string().url('올바른 URL이 아닙니다').nullable(),
  ),
})

export type VisitEditInput = z.infer<typeof visitEditSchema>
