'use client'

import { useEffect } from 'react'

// 프로덕션에서만 service worker 등록 [BR-PWA-02]
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      process.env.NODE_ENV === 'production' &&
      'serviceWorker' in navigator
    ) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // 등록 실패는 무시 (PWA는 점진적 향상)
      })
    }
  }, [])

  return null
}
