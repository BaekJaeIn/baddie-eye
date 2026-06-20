import { z } from 'zod'
import { isValidSlot } from '@/lib/booking/slots'

// [SECURITY-05] 고객 예약 신청 검증
const emptyToNull = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? null : v

export const memberBookingSchema = z.object({
  treatment_type_id: z.string().uuid('시술을 선택해주세요'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜를 선택해주세요'),
  time: z.string().refine(isValidSlot, '시간을 선택해주세요'),
  memo: z.preprocess(
    emptyToNull,
    z.string().max(500, '메모는 500자 이내로 입력해주세요').nullable(),
  ),
})

export type MemberBookingInput = z.infer<typeof memberBookingSchema>
