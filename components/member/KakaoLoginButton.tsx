'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getSiteOrigin } from '@/lib/site-url'

export default function KakaoLoginButton() {
  const [loading, setLoading] = useState(false)

  async function handleKakaoLogin() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${getSiteOrigin()}/auth/callback`,
        // 닉네임만 요청 — 카카오 이메일은 비즈앱 검수 필요(권한 없음)라
        // 기본 scope(이메일 포함)로 요청하면 KOE205가 발생한다.
        scopes: 'profile_nickname',
      },
    })
    if (error) setLoading(false)
    // 성공 시 카카오로 리다이렉트됨
  }

  return (
    <button
      onClick={handleKakaoLogin}
      disabled={loading}
      data-testid="kakao-login-button"
      className="flex w-full items-center justify-center gap-2 rounded-md bg-[#FEE500] px-4 py-3 font-medium text-[#191600] transition hover:brightness-95 disabled:opacity-60"
    >
      {loading ? '연결 중...' : '카카오로 로그인'}
    </button>
  )
}
