// 클라이언트 푸시 구독 유틸

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

// VAPID base64url 공개키 → Uint8Array (applicationServerKey)
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// 구독 시도 → PushSubscription(JSON) 반환 (실패/거부 시 null)
export async function subscribeToPush(): Promise<PushSubscriptionJSON | null> {
  if (!isPushSupported()) return null

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!vapidKey) return null

  // 권한 거부 상태면 재요청하지 않음 [BR-PS-02]
  if (Notification.permission === 'denied') return null

  const permission =
    Notification.permission === 'granted'
      ? 'granted'
      : await Notification.requestPermission()
  if (permission !== 'granted') return null

  const registration = await navigator.serviceWorker.ready

  // 기존 구독 있으면 재사용
  const existing = await registration.pushManager.getSubscription()
  if (existing) return existing.toJSON()

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    // TS의 Uint8Array 제네릭과 BufferSource 불일치 회피 — 런타임은 정상
    applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
  })
  return subscription.toJSON()
}
