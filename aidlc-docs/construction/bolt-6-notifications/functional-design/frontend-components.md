# Frontend Components — bolt-6-notifications

## 파일 구조

```
app/
├── (member)/me/
│   ├── push-actions.ts        # saveSubscriptionAction, deleteSubscriptionAction
│   └── page.tsx               # (수정) PushSubscriptionManager 포함
└── api/cron/reminders/
    └── route.ts               # Vercel Cron — 자동 리마인더 발송

components/push/
└── PushSubscriptionManager.tsx  # 구독 자동 시도 (Client)

lib/
├── supabase/admin.ts          # service_role 클라이언트 (Cron 전용)
├── push/
│   ├── web-push.ts            # web-push 설정 + 발송 헬퍼
│   └── subscribe.ts           # 클라이언트 구독 유틸
└── validations/push.ts        # subscriptionSchema

public/sw.js                   # (수정) push / notificationclick 핸들러
vercel.json                    # (신규) crons 설정
```

---

## PushSubscriptionManager (`components/push/PushSubscriptionManager.tsx`)

| 항목 | 내용 |
|------|------|
| 유형 | Client Component (마이페이지에 포함) |
| 책임 | 구독 상태 확인 → 권한 요청 → 구독 → 저장 [Q4, BR-PS-01~02] |

```
useEffect:
  1. 'serviceWorker' in navigator && 'PushManager' in window 확인
  2. 기존 구독 있으면 종료 (이미 구독)
  3. Notification.permission === 'denied'면 종료 (재요청 안 함)
  4. (granted 또는 default) → requestPermission → subscribe → saveSubscriptionAction
  5. 실패/미지원은 조용히 무시 (UI 깨지지 않음)
```

상태 UI (선택): "알림 켜짐/꺼짐" 작은 표시. iOS 미설치 시 안내 텍스트.
`data-testid="push-manager"`

---

## 클라이언트 구독 유틸 (`lib/push/subscribe.ts`)

```typescript
export function isPushSupported(): boolean
export function urlBase64ToUint8Array(base64: string): Uint8Array  // VAPID 키 변환
export async function subscribeToPush(): Promise<PushSubscriptionJSON | null>
```

---

## Server Actions (`app/(member)/me/push-actions.ts`)

```typescript
'use server'
// 구독 저장 [BR-PS-03,05]
saveSubscriptionAction(sub: PushSubscriptionJSON): Promise<void>
  - Zod 검증
  - user_id = auth.uid()
  - upsert by endpoint
// 구독 해제 (선택)
deleteSubscriptionAction(endpoint: string): Promise<void>
```

---

## Cron 엔드포인트 (`app/api/cron/reminders/route.ts`)

| 항목 | 내용 |
|------|------|
| 유형 | Route Handler (GET) |
| 인증 | Authorization: Bearer CRON_SECRET [BR-CR-01,02] |
| 클라이언트 | service_role (lib/supabase/admin.ts) |

```
1. 시크릿 검증 (불일치 → 401)
2. 대상 예약 조회 [BR-RM-01,02]:
   status='pending' AND scheduled_at ∈ (now+23h, now+24h] AND reminder_sent_at IS NULL
   + members(user_id), treatment_types(name) 조인
3. 각 예약:
   - push_subscriptions where user_id → 발송
   - web-push sendNotification(payload)
   - 성공 → reminder_sent_at = now()
   - 410 → 구독 삭제 [BR-RM-05]
4. { sent, failed } 반환
```

`export const dynamic = 'force-dynamic'` (캐시 방지)

---

## web-push 헬퍼 (`lib/push/web-push.ts`)

```typescript
import webpush from 'web-push'
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)
export async function sendPush(sub, payload): Promise<{ ok: boolean; gone?: boolean }>
```

---

## service_role 클라이언트 (`lib/supabase/admin.ts`)

```typescript
import { createClient } from '@supabase/supabase-js'
// Cron 전용 — RLS 우회. 서버에서만 import.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}
```

> ⚠️ 이 모듈은 절대 클라이언트 컴포넌트에서 import 금지.

---

## sw.js 확장 (`public/sw.js`)

기존(Bolt 4) install/activate/fetch에 추가:
```javascript
self.addEventListener('push', (event) => { ... showNotification ... })
self.addEventListener('notificationclick', (event) => { ... openWindow ... })
```

---

## vercel.json (신규)

```json
{
  "crons": [
    { "path": "/api/cron/reminders", "schedule": "0 * * * *" }
  ]
}
```
매시간 정각 실행.

---

## 마이페이지 수정 (`(member)/me/page.tsx`)

- `<PushSubscriptionManager />` 포함 (등급/포인트 카드 근처)
- iOS 미설치 안내는 컴포넌트 내부에서 조건부 표시

---

## 검증 스키마 (`lib/validations/push.ts`)

```typescript
export const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
})
```
