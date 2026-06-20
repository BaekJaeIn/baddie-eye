import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 카카오 OAuth 콜백 — code를 세션으로 교환 후 /me로.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // 연결 여부는 /me 페이지에서 판단 (미연결 시 /onboarding)
      return NextResponse.redirect(`${origin}/me`)
    }
  }

  // 실패 시 로그인으로
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
