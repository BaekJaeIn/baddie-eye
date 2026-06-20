'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

// [SECURITY-15] 페이지 레벨 에러 바운더리 — generic UI, 상세는 Sentry로만.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4">
      <h2 className="text-lg font-semibold text-gray-800">
        문제가 발생했습니다
      </h2>
      <p className="text-sm text-gray-500">
        잠시 후 다시 시도해주세요. 문제가 계속되면 관리자에게 문의하세요.
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-brand px-4 py-2 text-sm text-white hover:bg-brand-dark"
      >
        다시 시도
      </button>
    </main>
  )
}
