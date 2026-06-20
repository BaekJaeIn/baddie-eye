import * as Sentry from '@sentry/nextjs'
import { createClient } from '@/lib/supabase/server'

const GENERIC_AUTH_ERROR = '이메일 또는 비밀번호가 올바르지 않습니다'
const GENERIC_TRANSIENT_ERROR = '일시적 오류가 발생했습니다. 다시 시도해주세요.'

export interface AuthResult {
  error?: string
}

// [SECURITY-09] 인증 실패 시 구체적 원인(이메일 없음/비밀번호 틀림)을 노출하지 않음.
// [SECURITY-15] 모든 외부 호출 try/catch, fail-closed.
// [SECURITY-03] 상세 에러는 Sentry로만, 사용자에게는 generic 메시지.
export async function signIn(
  email: string,
  password: string,
): Promise<AuthResult> {
  const supabase = createClient()
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      // 인증 실패는 정상 흐름 — Sentry에 보내지 않음 (노이즈 방지)
      return { error: GENERIC_AUTH_ERROR }
    }
    return {}
  } catch (err) {
    // 네트워크/서비스 오류 등 예외적 상황만 추적
    Sentry.captureException(err)
    return { error: GENERIC_TRANSIENT_ERROR }
  }
}

export async function signOut(): Promise<void> {
  const supabase = createClient()
  try {
    await supabase.auth.signOut()
  } catch (err) {
    Sentry.captureException(err)
    // 로그아웃 실패해도 사용자는 로그인 페이지로 보냄 (fail-closed)
  }
}

export async function getSession() {
  const supabase = createClient()
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (err) {
    Sentry.captureException(err)
    return null
  }
}
