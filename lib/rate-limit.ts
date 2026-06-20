// [SECURITY-11] 로그인 브루트포스 방어 — In-memory sliding window.
//
// 주의: Vercel 서버리스 환경에서는 인스턴스 간 메모리가 공유되지 않으므로
// 완벽한 방어는 아니다. Supabase Auth 자체 브루트포스 보호와 이중 방어로 수용.
// 트래픽 증가 시 Upstash Redis 등 분산 스토어로 전환할 것.

const WINDOW_MS = 5 * 60 * 1000 // 5분
const MAX_ATTEMPTS = 5

const store = new Map<string, number[]>()

export interface RateLimitResult {
  allowed: boolean
  retryAfterSec?: number
}

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now()
  const windowStart = now - WINDOW_MS

  const attempts = (store.get(key) ?? []).filter((ts) => ts > windowStart)

  if (attempts.length >= MAX_ATTEMPTS) {
    const oldest = attempts[0]
    const retryAfterSec = Math.ceil((oldest + WINDOW_MS - now) / 1000)
    store.set(key, attempts)
    return { allowed: false, retryAfterSec }
  }

  attempts.push(now)
  store.set(key, attempts)
  return { allowed: true }
}

// 로그인 성공 시 카운터 초기화에 사용
export function resetRateLimit(key: string): void {
  store.delete(key)
}
