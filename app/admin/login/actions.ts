'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { signIn, signOut } from '@/lib/auth/authService'
import { loginSchema } from '@/lib/validations/auth'
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit'

export interface LoginActionState {
  error?: string
}

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  // [SECURITY-11] 레이트리밋 — IP 기준
  const ip = headers().get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rate = checkRateLimit(`login:${ip}`)
  if (!rate.allowed) {
    return {
      error: `로그인 시도가 너무 많습니다. ${rate.retryAfterSec}초 후 다시 시도해주세요.`,
    }
  }

  // [SECURITY-05] 서버사이드 Zod 검증 (신뢰 경계)
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '입력값을 확인해주세요' }
  }

  const { error } = await signIn(parsed.data.email, parsed.data.password)
  if (error) {
    return { error }
  }

  // 로그인 성공 → 레이트리밋 카운터 초기화
  resetRateLimit(`login:${ip}`)
  redirect('/admin/dashboard')
}

export async function logoutAction(): Promise<void> {
  await signOut()
  redirect('/admin/login')
}
