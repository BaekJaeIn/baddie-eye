'use server'

import { redirect } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'
import { createClient } from '@/lib/supabase/server'
import { onboardingSchema } from '@/lib/validations/onboarding'

export interface OnboardingActionState {
  error?: string
}

const GENERIC_ERROR = '연결 중 오류가 발생했습니다. 다시 시도해주세요.'
const ALREADY_LINKED = '이미 다른 계정에 연결된 연락처입니다. 샵에 문의해주세요.'

export async function connectMemberAction(
  _prev: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const parsed = onboardingSchema.safeParse({ phone: formData.get('phone') })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '입력값을 확인해주세요' }
  }

  // 카카오 닉네임 (자동 생성 시 이름으로 사용) [BR-MB-05]
  const kakaoName =
    (user.user_metadata?.name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined) ??
    '고객'

  try {
    const { error } = await supabase.rpc('link_or_create_member', {
      p_phone: parsed.data.phone,
      p_name: kakaoName,
    })
    if (error) {
      if (error.message.includes('PHONE_ALREADY_LINKED')) {
        return { error: ALREADY_LINKED }
      }
      Sentry.captureException(error)
      return { error: GENERIC_ERROR }
    }
  } catch (err) {
    Sentry.captureException(err)
    return { error: GENERIC_ERROR }
  }

  redirect('/me')
}
