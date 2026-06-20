import { type NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

// [SECURITY-08] deny-by-default 접근 제어.
const PUBLIC_ADMIN_PATHS = ['/admin/login']
// 고객 보호 경로 (미인증 시 /login)
const MEMBER_PROTECTED_PREFIXES = ['/me', '/onboarding']

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request)

  // 세션 쿠키 갱신 포함. getUser()는 서버에서 토큰을 검증한다.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // --- 고객 영역 (/me, /onboarding) ---
  const isMemberProtected = MEMBER_PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  )
  if (isMemberProtected) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    return response
  }

  // --- Admin 영역 (/admin/*) ---
  if (pathname.startsWith('/admin')) {
    const isPublic = PUBLIC_ADMIN_PATHS.includes(pathname)

    // 미인증 + 보호 경로 → Admin 로그인
    if (!user && !isPublic) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }

    // 인증됨 + Admin 로그인 페이지 → 대시보드 (중복 로그인 방지)
    if (user && pathname === '/admin/login') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/me/:path*', '/onboarding/:path*'],
}
