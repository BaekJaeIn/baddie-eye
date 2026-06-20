'use client'

import { useEffect, useState } from 'react'
import { isPushSupported, subscribeToPush } from '@/lib/push/subscribe'
import { saveSubscriptionAction } from '@/app/(member)/me/push-actions'

type PushState = 'idle' | 'enabled' | 'unsupported' | 'denied'

export default function PushSubscriptionManager() {
  const [state, setState] = useState<PushState>('idle')

  useEffect(() => {
    let active = true

    async function run() {
      if (!isPushSupported()) {
        if (active) setState('unsupported')
        return
      }
      if (Notification.permission === 'denied') {
        if (active) setState('denied')
        return
      }

      // [BR-PS-01] 마이페이지 진입 시 구독 시도
      try {
        const sub = await subscribeToPush()
        if (!active) return
        if (sub) {
          await saveSubscriptionAction(sub)
          setState('enabled')
        }
      } catch {
        // 미지원/거부 등은 조용히 무시 [BR-PS-06]
      }
    }

    run()
    return () => {
      active = false
    }
  }, [])

  if (state === 'enabled') {
    return (
      <p
        data-testid="push-manager"
        className="text-center text-xs text-gray-400"
      >
        🔔 예약 리마인더 알림이 켜져 있습니다.
      </p>
    )
  }

  if (state === 'unsupported') {
    return (
      <p
        data-testid="push-manager"
        className="text-center text-xs text-gray-400"
      >
        알림을 받으려면 홈 화면에 추가 후 사용해주세요. (iOS는 설치 후 지원)
      </p>
    )
  }

  // idle/denied는 별도 UI 없음
  return <div data-testid="push-manager" className="hidden" />
}
