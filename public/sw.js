// Baddie Eye — service worker (Bolt 4 + Bolt 6 push)

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// 네트워크 우선 — 캐시 미사용 (최신 데이터 보장).
self.addEventListener('fetch', () => {
  // 기본 브라우저 동작에 위임
})

// [Bolt 6] 푸시 수신 → 알림 표시
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = {}
  }
  const title = data.title || 'Baddie Eye'
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url || '/me' },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

// 알림 클릭 → 해당 페이지 열기 (이미 열려 있으면 포커스)
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = (event.notification.data && event.notification.data.url) || '/me'
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && 'focus' in client) {
            return client.focus()
          }
        }
        return self.clients.openWindow(targetUrl)
      }),
  )
})
