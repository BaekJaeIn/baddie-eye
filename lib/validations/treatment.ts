import { z } from 'zod'

// [SECURITY-05] 시술 종류 입력 검증
const emptyToNull = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? null : v

export const treatmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, '시술명을 입력해주세요')
    .max(50, '시술명은 50자 이내로 입력해주세요'),
  duration_min: z.coerce
    .number()
    .int('소요시간은 정수여야 합니다')
    .min(1, '소요시간은 1분 이상이어야 합니다'),
  base_price: z.coerce
    .number()
    .int('가격은 정수여야 합니다')
    .min(0, '가격은 0 이상이어야 합니다'),
  recommended_interval_days: z.preprocess(
    emptyToNull,
    z.coerce
      .number()
      .int('권장 주기는 정수여야 합니다')
      .min(1, '권장 주기는 1일 이상이어야 합니다')
      .nullable(),
  ),
})

export type TreatmentInput = z.infer<typeof treatmentSchema>
