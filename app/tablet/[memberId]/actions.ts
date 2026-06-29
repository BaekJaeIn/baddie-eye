'use server'

import { redirect } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'
import { createClient } from '@/lib/supabase/server'
import { TERMS_VERSION } from '@/lib/consent/terms'

export interface ConsentActionState {
  error?: string
}

const GENERIC_ERROR = '저장 중 오류가 발생했습니다. 다시 시도해주세요.'

// 태블릿 동의서 제출 — 회원의 규약 동의/거부 결과를 기록한다.
// 태블릿은 관리자 세션으로 동작하므로 RLS(admin 전용)를 통과한다.
export async function submitConsentAction(
  memberId: string,
  agreed: boolean,
): Promise<ConsentActionState> {
  const supabase = createClient()

  try {
    // 대상 회원이 실제로 존재하는지 확인 (잘못된 id 방지)
    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('id', memberId)
      .eq('is_active', true)
      .single()
    if (!member) {
      return { error: '회원을 찾을 수 없습니다.' }
    }

    const { error } = await supabase.from('consents').insert({
      member_id: memberId,
      terms_version: TERMS_VERSION,
      agreed,
    })
    if (error) {
      Sentry.captureException(error)
      return { error: GENERIC_ERROR }
    }
  } catch (err) {
    Sentry.captureException(err)
    return { error: GENERIC_ERROR }
  }

  redirect(`/tablet/complete?agreed=${agreed ? '1' : '0'}`)
}
