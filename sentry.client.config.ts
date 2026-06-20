import * as Sentry from '@sentry/nextjs'
import { maskPII } from '@/lib/sentry-pii'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

// DSN이 없으면 Sentry 비활성 (앱은 정상 동작)
if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    // [SECURITY-03] 개발환경 전송 안 함 + PII 마스킹
    enabled: process.env.NODE_ENV === 'production',
    beforeSend(event) {
      return maskPII(event)
    },
  })
}
