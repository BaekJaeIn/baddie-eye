'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function KakaoLoginButton() {
  const [loading, setLoading] = useState(false)

  async function handleKakaoLogin() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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
