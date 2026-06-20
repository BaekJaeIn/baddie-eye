'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

// [SECURITY-15] 최후 방어선 — 루트 레이아웃 자체 에러까지 캐치.
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="ko">
      <body>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            fontFamily: 'sans-serif',
          }}
        >
          <h2>문제가 발생했습니다</h2>
          <p>잠시 후 다시 시도해주세요.</p>
        </main>
      </body>
    </html>
  )
}
