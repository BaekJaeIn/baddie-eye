import { z } from 'zod'
import { isValidSlot } from '@/lib/booking/slots'

// [SECURITY-05] 예약 입력 검증
const emptyToNull = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? null : v

export const appointmentSchema = z.object({
  member_id: z.string().uuid('회원을 선택해주세요'),
  treatment_type_id: z.string().uuid('시술 종류를 선택해주세요'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜를 선택해주세요'),
  time: z
    .string()
    .refine(isValidSlot, '영업시간 내 30분 단위 시간을 선택해주세요'),
  memo: z.preprocess(
    emptyToNull,
    z.string().max(500, '메모는 500자 이내로 입력해주세요').nullable(),
  ),
})

export type AppointmentInput = z.infer<typeof appointmentSchema>
