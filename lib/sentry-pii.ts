import type { ErrorEvent } from '@sentry/nextjs'

// [SECURITY-03] PII 마스킹 — 이메일/전화번호/토큰이 Sentry로 새지 않도록.
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
const PHONE_RE = /01[016789][-\s]?\d{3,4}[-\s]?\d{4}/g

function scrub(value: string): string {
  return value
    .replace(EMAIL_RE, (m) => `${m[0]}***@***`)
    .replace(PHONE_RE, '010-****-****')
}

function scrubDeep(input: unknown): unknown {
  if (typeof input === 'string') return scrub(input)
  if (Array.isArray(input)) return input.map(scrubDeep)
  if (input && typeof input === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(input)) {
      // 민감 키는 완전 제거
      if (/password|token|secret|authorization|cookie/i.test(k)) {
        out[k] = '[redacted]'
      } else {
        out[k] = scrubDeep(v)
      }
    }
    return out
  }
  return input
}

export function maskPII(event: ErrorEvent): ErrorEvent {
  // 사용자 식별 정보 제거
  if (event.user) {
    delete event.user.email
    delete event.user.ip_address
  }
  // request 데이터 스크럽
  if (event.request) {
    event.request = scrubDeep(event.request) as ErrorEvent['request']
  }
  // 예외 메시지 스크럽
  if (event.exception?.values) {
    for (const ex of event.exception.values) {
      if (ex.value) ex.value = scrub(ex.value)
    }
  }
  return event
}
