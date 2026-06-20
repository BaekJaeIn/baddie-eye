// [SECURITY-04] HTTP 보안 헤더 — 모든 HTML 서빙 엔드포인트에 적용
const isDev = process.env.NODE_ENV !== 'production'

// script-src:
//  - dev: Next.js HMR/React Refresh가 eval + 인라인 스크립트를 사용하므로 불가피
//  - prod: Next.js 부트스트랩 인라인 스크립트 때문에 'unsafe-inline' 필요
//    (nonce 기반 CSP 강화는 추후 과제 — Next.js 미들웨어 nonce 주입 필요)
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
  : "script-src 'self' 'unsafe-inline'"

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    // style-src 'unsafe-inline': Next.js/Tailwind 인라인 스타일 때문에 불가피 (문서화된 예외)
    // connect-src: Supabase, Sentry 도메인 명시적 허용
    value: [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://*.supabase.co https://*.kakaocdn.net http://k.kakaocdn.net",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co https://*.sentry.io wss://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
