# 웹푸시 알림 설정 가이드 (Bolt 6)

Bolt 6 코드는 완성됐지만, 실제 푸시 알림이 동작하려면 아래 설정이 필요합니다.

---

## 1. 마이그레이션 007 실행

Supabase SQL Editor에서 `supabase/migrations/007_push_notifications.sql` 실행.
- push_subscriptions 테이블 + RLS
- appointments.reminder_sent_at 컬럼

---

## 2. VAPID 키 생성

웹푸시 서명에 필요한 키 쌍을 생성합니다:

```bash
npx web-push generate-vapid-keys
```

출력 예:
```
Public Key:  BLxxxx...
Private Key: yyyy...
```

---

## 3. 환경변수 설정

`.env.local`(로컬) 및 Vercel 환경변수에 추가:

```bash
# 클라이언트 노출 OK (구독용 공개키)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BLxxxx...

# 서버 전용 (절대 클라이언트 노출 금지)
VAPID_PRIVATE_KEY=yyyy...
VAPID_SUBJECT=mailto:원장님_이메일@example.com

# Cron 인증 — 임의의 긴 랜덤 문자열
CRON_SECRET=<openssl rand -hex 32 등으로 생성>

# Supabase service_role 키 (Cron RLS 우회용)
# Supabase 대시보드 > Project Settings > API > service_role (secret)
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

> ⚠️ `VAPID_PRIVATE_KEY`, `CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`는
> 절대 `NEXT_PUBLIC_` 접두사를 붙이지 마세요. 클라이언트 번들에 노출됩니다.

---

## 4. Vercel Cron 활성화

`vercel.json`에 이미 설정되어 있습니다:
```json
{ "crons": [{ "path": "/api/cron/reminders", "schedule": "0 * * * *" }] }
```

- 배포 시 Vercel이 자동으로 Cron을 등록합니다.
- Vercel이 호출 시 `Authorization: Bearer $CRON_SECRET` 헤더를 자동 첨부합니다
  (CRON_SECRET 환경변수가 설정되어 있어야 함).

**플랜 주의**:
- **Hobby 플랜**: Cron은 하루 1회로 제한 → 매시간 리마인더 불가. 24시간 전 정확 발송이 어려움.
- **Pro 플랜**: 분 단위 Cron 가능 → 매시간 정상 동작.
- Hobby에서 쓰려면 schedule을 `"0 9 * * *"`(매일 오전 9시) 등으로 바꾸고 "내일 예약" 전체 발송 방식으로 조정 검토.

---

## 5. 동작 확인

### 구독
1. 마이그레이션 + 환경변수 설정 후 배포(HTTPS 필수)
2. 모바일에서 `/me` 접속 → 알림 권한 허용
3. push_subscriptions 테이블에 행이 생기는지 확인

### 발송 테스트 (수동)
Cron을 기다리지 않고 수동 호출:
```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-app.vercel.app/api/cron/reminders
# → { "sent": N, "failed": 0, "scanned": M }
```
24시간 후(±1h) 확정 예약이 있고 구독이 있으면 푸시가 전송됩니다.

---

## 브라우저/OS 제약

| 환경 | 지원 |
|------|------|
| Android Chrome | ✅ 전체 지원 |
| 데스크탑 Chrome/Edge/Firefox | ✅ 지원 |
| **iOS Safari** | ⚠️ 16.4+ & **PWA 홈화면 설치 후에만** 푸시 가능 |

iOS 사용자는 "홈 화면에 추가" 후 실행해야 알림을 받을 수 있습니다.
PushSubscriptionManager가 미설치/미지원 시 안내 문구를 표시합니다.

---

## 보안 요약

- 구독은 고객 본인(user_id)만 RLS로 관리
- Cron은 CRON_SECRET으로 무단 호출 차단
- service_role 키로 전체 예약/구독 조회(발송용) — 서버에서만
- 푸시 페이로드에 전화번호 등 PII 미포함
