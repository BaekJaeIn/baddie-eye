# Business Rules — bolt-6-notifications

## 구독 규칙

| ID | 규칙 |
|----|------|
| BR-PS-01 | 마이페이지 진입 시 미구독 + 권한 가능하면 구독 시도 [Q4] |
| BR-PS-02 | 권한 거부(denied) 시 재요청 안 함 |
| BR-PS-03 | 구독은 endpoint UNIQUE — 같은 기기 재구독 시 upsert |
| BR-PS-04 | 한 회원이 여러 기기 구독 가능 (각 endpoint 별도 행) |
| BR-PS-05 | 구독은 user_id에 연결, RLS로 자기 것만 |
| BR-PS-06 | iOS는 PWA 설치 후에만 가능 — 미지원 시 안내, 에러 없이 패스 |

---

## 발송 규칙 [Q1=B, Q3=A]

| ID | 규칙 |
|----|------|
| BR-RM-01 | 리마인더 대상: status='pending' + scheduled_at ∈ (now+23h, now+24h] |
| BR-RM-02 | reminder_sent_at IS NULL인 예약만 (중복 방지) |
| BR-RM-03 | 발송 성공 시 reminder_sent_at = now() 기록 |
| BR-RM-04 | 회원의 모든 구독 기기에 발송 |
| BR-RM-05 | 410 Gone 응답(만료 구독) → 해당 구독 삭제 |
| BR-RM-06 | 발송 실패(기타)는 Sentry 기록, reminder_sent_at은 갱신 안 함(재시도 여지) — 단, 무한재시도 방지 위해 1회만 갱신 정책: 성공 시에만 갱신 |
| BR-RM-07 | requested/cancelled/completed 예약은 리마인더 대상 아님 |

---

## Cron 보안 규칙 [SECURITY-08]

| ID | 규칙 |
|----|------|
| BR-CR-01 | /api/cron/reminders는 Authorization: Bearer CRON_SECRET 필수 |
| BR-CR-02 | 시크릿 불일치 → 401 |
| BR-CR-03 | Cron 엔드포인트는 service_role 키 사용 (서버 전용, 환경변수) |
| BR-CR-04 | service_role 키는 절대 클라이언트 노출 금지 (NEXT_PUBLIC_ 아님) |

---

## 알림 페이로드 규칙

| ID | 규칙 |
|----|------|
| BR-PL-01 | title: "예약 리마인더" |
| BR-PL-02 | body: "내일 {HH:mm} {시술명} 예약이 있어요" |
| BR-PL-03 | url: /me/appointments (클릭 시 이동) |
| BR-PL-04 | PII(전화번호 등) 페이로드 미포함 [SECURITY-03] |

---

## 환경변수 [SECURITY-12]

| 변수 | 노출 | 용도 |
|------|------|------|
| NEXT_PUBLIC_VAPID_PUBLIC_KEY | 클라이언트 OK | 구독 시 applicationServerKey |
| VAPID_PRIVATE_KEY | **서버 전용** | web-push 서명 |
| VAPID_SUBJECT | 서버 | mailto: 연락처 |
| CRON_SECRET | **서버 전용** | Cron 인증 |
| SUPABASE_SERVICE_ROLE_KEY | **서버 전용** | Cron의 RLS 우회 조회/발송 |

> service_role/VAPID_PRIVATE/CRON_SECRET은 Vercel 환경변수로만. 클라이언트 번들 금지.

---

## RLS / 데이터 접근 [SECURITY-06]

| ID | 규칙 |
|----|------|
| BR-RLS-20 | push_subscriptions: 고객 자기 것만 (user_id) |
| BR-RLS-21 | Cron은 service_role로 전체 접근 (RLS 우회) |

---

## 입력 검증 [SECURITY-05]

| 스키마 | 파일 |
|--------|------|
| subscriptionSchema | `lib/validations/push.ts` (endpoint, keys.p256dh, keys.auth) |

---

## 새 인프라 / 의존성

| 항목 | 내용 |
|------|------|
| web-push | 서버 발송 라이브러리 (package.json 추가) |
| vercel.json | crons: 매시간 /api/cron/reminders |
| Supabase service_role 클라이언트 | `lib/supabase/admin.ts` (Cron 전용) |
