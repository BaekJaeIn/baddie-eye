import { type NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

// [SECURITY-08] deny-by-default 접근 제어.
const PUBLIC_ADMIN_PATHS = ['/admin/login']

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request)

  // 세션 쿠키 갱신 포함. getUser()는 서버에서 토큰을 검증한다.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // --- 태블릿 동의서 영역 (/tablet) — 관리자가 매장에서 운영 ---
  // 관리자(로그인) 세션이 있어야 접근 가능. 미인증 시 Admin 로그인으로.
  if (pathname.startsWith('/tablet')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
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
  matcher: ['/admin/:path*', '/tablet/:path*'],
}
