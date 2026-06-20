import { z } from 'zod'

// [SECURITY-05] 입력 검증 — 신뢰 경계(서버)에서 사용하는 단일 스키마.
// 클라이언트 HTML5 검증은 UX 보조일 뿐, 이 스키마가 진짜 검증.
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식을 입력해주세요')
    .max(254, '이메일이 너무 깁니다'),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다')
    .max(128, '비밀번호가 너무 깁니다'),
})

export type LoginInput = z.infer<typeof loginSchema>
