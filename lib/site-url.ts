/**
 * 앱의 절대 기준 주소(origin)를 반환한다.
 *
 * 설치된 PWA / 카카오톡 인앱 브라우저 등 일부 환경에서는
 * `window.location.origin`이 문자열 "null" 로 평가되어
 * OAuth redirect가 `null/auth/callback` 처럼 깨진다.
 * 따라서 빌드 타임 환경변수(NEXT_PUBLIC_SITE_URL)를 우선 사용하고,
 * 없을 때만 신뢰 가능한 window origin으로 폴백한다.
 */
export function getSiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/+$/, '')

  if (typeof window !== 'undefined') {
    const origin = window.location.origin
    if (origin && origin !== 'null') return origin.replace(/\/+$/, '')
  }

  return ''
}
