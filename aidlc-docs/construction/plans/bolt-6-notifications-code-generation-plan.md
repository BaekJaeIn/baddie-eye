# Code Generation Plan — bolt-6-notifications

> 단일 진실 공급원. 각 단계 완료 시 [x] 체크.

## 단위 컨텍스트

| 항목 | 내용 |
|------|------|
| Unit | bolt-6-notifications |
| 의존성 | Bolt 4(sw.js/마이페이지), Bolt 5(appointments) |
| NFR | 패턴 재사용 SKIP |
| 신규 인프라 | web-push, Vercel Cron, service_role 클라이언트 |

---

## 실행 단계

### Step 1: 의존성 + DB 마이그레이션
- [x] `package.json` 수정 — web-push, @types/web-push 추가
- [x] `supabase/migrations/007_push_notifications.sql`
  - push_subscriptions 테이블 + RLS(자기 것)
  - appointments.reminder_sent_at 컬럼
- [x] `.env.local.example` 수정 — VAPID/CRON_SECRET/SERVICE_ROLE 추가

### Step 2: 검증 + 클라이언트 유틸
- [x] `lib/validations/push.ts` — subscriptionSchema
- [x] `lib/push/subscribe.ts` — isPushSupported, urlBase64ToUint8Array, subscribeToPush
- [x] `lib/supabase/admin.ts` — service_role 클라이언트

### Step 3: 구독 저장 + 매니저
- [x] `app/(member)/me/push-actions.ts` — saveSubscriptionAction, deleteSubscriptionAction
- [x] `components/push/PushSubscriptionManager.tsx`
- [x] `app/(member)/me/page.tsx` 수정 — 매니저 포함

### Step 4: SW 푸시 핸들러
- [x] `public/sw.js` 수정 — push / notificationclick

### Step 5: 발송 + Cron
- [x] `lib/push/web-push.ts` — VAPID 설정 + sendPush
- [x] `app/api/cron/reminders/route.ts` — Cron 엔드포인트
- [x] `vercel.json` — crons 매시간

### Step 6: 테스트
- [x] `tests/unit/push.validation.test.ts`
- [x] `tests/unit/subscribe.test.ts` — urlBase64ToUint8Array
- [x] `tests/e2e/cron.spec.ts` — 시크릿 없이 호출 시 401

### Step 7: 빌드/테스트 검증 + 문서
- [x] `pnpm test` + `pnpm build` 실제 실행
- [x] `aidlc-docs/construction/bolt-6-notifications/code/code-summary.md`
- [x] `aidlc-docs/construction/bolt-6-notifications/code/push-setup-guide.md` — VAPID/Cron 설정 가이드

---

## 요구사항 추적

| 요구사항 | 단계 |
|----------|------|
| FR-11 웹푸시 수신 | Step 2,3,4 |
| FR-07 리마인더 발송 | Step 5 |
| 구독 동의 (Q4) | Step 3 |
| 자동 발송 (Q1=B, Q3=A) | Step 5 |

## 사용자 작업 (배포 시)
- 마이그레이션 007 실행
- VAPID 키 생성 (`npx web-push generate-vapid-keys`)
- Vercel 환경변수: NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, CRON_SECRET, SUPABASE_SERVICE_ROLE_KEY
- Vercel Cron 자동 활성화 (vercel.json)

## 예상 규모
약 16개 파일 (신규 13 + 수정 3: package/me/sw)
