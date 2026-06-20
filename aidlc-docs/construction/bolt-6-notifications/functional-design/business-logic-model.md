# Business Logic Model — bolt-6-notifications

## 설계 결정 (사용자 답변)

| 질문 | 결정 |
|------|------|
| Q1 발송 방식 | 자동 발송 (Vercel Cron 스케줄러) |
| Q2 알림 종류 | 예약 리마인더만 |
| Q3 타이밍 | 예약 24시간 전 |
| Q4 구독 동의 | 마이페이지 진입 시 자동 권한 요청 |
| Q5 범위 | 전체 구현 (구독 + 발송) |

---

## 1. 푸시 구독 흐름 [Q4]

```
[마이페이지 진입] PushSubscriptionManager (Client)
    |
    | 1. 브라우저 지원 + 미구독 상태 확인
    | 2. Notification.requestPermission()
    |    - granted → 계속
    |    - denied/default → 조용히 패스 (재요청 안 함)
    | 3. serviceWorker.ready → pushManager.subscribe({
    |      userVisibleOnly: true,
    |      applicationServerKey: NEXT_PUBLIC_VAPID_PUBLIC_KEY
    |    })
    | 4. saveSubscriptionAction(subscription)
    |    → push_subscriptions 저장 (endpoint UNIQUE upsert)
    v
[구독 완료 — 이후 푸시 수신 가능]
```

**제약 안내**:
- iOS 16.4+ : PWA 홈화면 설치 후에만 푸시 가능 → 미설치 시 안내 문구
- 권한 거부 시 재요청하지 않음 (브라우저 정책)

---

## 2. 자동 리마인더 발송 (Vercel Cron) [Q1=B, Q3=A]

```
[Vercel Cron] 매시간 정각 → GET /api/cron/reminders
    | Authorization: Bearer CRON_SECRET 검증 [보안]
    v
[리마인더 대상 조회]
    | scheduled_at ∈ (now+23h, now+24h]
    | AND status = 'pending' (확정 예약만)
    | AND reminder_sent_at IS NULL (미발송)
    v
[각 예약마다]
    | 1. 회원의 push_subscriptions 조회
    | 2. web-push.sendNotification(subscription, payload)
    |    payload: { title: '예약 리마인더', body: '내일 HH:mm 예약이 있어요', url: '/me/appointments' }
    | 3. 발송 성공 → reminder_sent_at = now()
    | 4. 410 Gone(만료 구독) → push_subscriptions에서 삭제
    v
[완료 — 결과 카운트 반환]
```

**중복 방지**: `appointments.reminder_sent_at` 기록. 매시간 돌아도 한 번만 발송.
**윈도우**: 매시간 Cron + 1시간 윈도우(23~24h)로 24시간 전 ±1h 내 1회 발송.

---

## 3. Service Worker 푸시 처리 (sw.js 확장)

```javascript
// push 이벤트 → 알림 표시
self.addEventListener('push', (event) => {
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body, icon: '/icon-192.png', data: { url: data.url }
    })
  )
})

// 알림 클릭 → 해당 페이지 열기
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data.url))
})
```

---

## 4. 스키마 변경 (마이그레이션 007)

```sql
-- 푸시 구독 저장
CREATE TABLE push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL UNIQUE,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_push_subscriptions_user ON push_subscriptions (user_id);

-- RLS: 자기 구독만
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY push_sub_owner ON push_subscriptions FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 리마인더 중복 방지
ALTER TABLE appointments ADD COLUMN reminder_sent_at TIMESTAMPTZ;
```

> Cron 엔드포인트는 service_role 키로 접근 (RLS 우회) — 모든 회원 예약/구독 조회 필요.

---

## 5. 발송 경로의 권한 [보안]

| 주체 | 키 | 용도 |
|------|-----|------|
| 구독 저장 (고객) | anon + 세션 | 자기 push_subscriptions upsert (RLS) |
| Cron 발송 (서버) | service_role | 전체 예약/구독 조회 + 발송 (RLS 우회) |
| Cron 인증 | CRON_SECRET | 외부 무단 호출 차단 |
| 푸시 서명 | VAPID 키 | web-push 발송 인증 |
