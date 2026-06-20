# Code Summary — bolt-6-notifications

> 검증: 단위 테스트 75/75 통과, 프로덕션 빌드 성공 (26 라우트).

## 생성/수정 파일

### 의존성/DB (Step 1)
| 파일 | 상태 | 역할 |
|------|------|------|
| `package.json` | 수정 | web-push, @types/web-push 추가 |
| `supabase/migrations/007_push_notifications.sql` | 생성 | push_subscriptions + RLS + appointments.reminder_sent_at |
| `.env.local.example` | 수정 | VAPID/CRON_SECRET/SERVICE_ROLE 추가 |

### 검증/유틸 (Step 2)
| 파일 | 상태 |
|------|------|
| `lib/validations/push.ts` | 생성 (subscriptionSchema) |
| `lib/push/subscribe.ts` | 생성 (구독 유틸, VAPID 키 변환) |
| `lib/supabase/admin.ts` | 생성 (service_role 클라이언트, Cron 전용) |

### 구독 (Step 3)
| 파일 | 상태 |
|------|------|
| `app/(member)/me/push-actions.ts` | 생성 (save/delete 구독) |
| `components/push/PushSubscriptionManager.tsx` | 생성 (자동 구독 시도) |
| `app/(member)/me/page.tsx` | 수정 (매니저 포함) |

### SW (Step 4)
| 파일 | 변경 |
|------|------|
| `public/sw.js` | push / notificationclick 핸들러 추가 |

### 발송/Cron (Step 5)
| 파일 | 상태 |
|------|------|
| `lib/push/web-push.ts` | 생성 (VAPID 설정 + sendPush, 410 처리) |
| `app/api/cron/reminders/route.ts` | 생성 (Cron 엔드포인트) |
| `vercel.json` | 생성 (crons 매시간) |

### 테스트 (Step 6)
| 파일 | 케이스 |
|------|--------|
| `tests/unit/push.validation.test.ts` | 4 |
| `tests/unit/subscribe.test.ts` | 3 |
| `tests/e2e/cron.spec.ts` | 2 시나리오 |

## 라우트 (신규)

```
/api/cron/reminders   Vercel Cron — 24시간 전 리마인더 자동 발송
```

## 핵심 로직

| 기능 | 구현 |
|------|------|
| 구독 | 마이페이지 진입 시 권한 요청 → subscribe → push_subscriptions upsert(endpoint) |
| 자동 발송 | Cron 매시간 → status='pending' + scheduled_at ∈ (now+23h, now+24h] + reminder_sent_at NULL |
| 중복 방지 | 발송 성공 시 reminder_sent_at 기록 |
| 만료 구독 | 410/404 → push_subscriptions 삭제 |
| SW | push → showNotification, click → 마이페이지 포커스/열기 |

## 보안

| 규칙 | 적용 |
|------|------|
| SECURITY-05 | subscriptionSchema |
| SECURITY-06 | push_subscriptions RLS(자기 것), Cron은 service_role |
| SECURITY-08 | Cron CRON_SECRET 인증(401), service_role 서버 전용 |
| SECURITY-03 | 페이로드에 PII 미포함 |
| SECURITY-12 | VAPID_PRIVATE/CRON_SECRET/service_role 서버 전용 환경변수 |

## 검증 결과

- ✅ 단위 테스트 75/75 통과 (Bolt1~5: 68 + Bolt6: 7)
- ✅ 프로덕션 빌드 성공 (26 라우트 + 미들웨어)
- ✅ TypeScript strict + ESLint 통과
- 빌드 중 수정: subscribe.ts Uint8Array→BufferSource 캐스팅 (TS 5.9 제네릭 변경)

## 사용자 작업 (배포 시)

[push-setup-guide.md](push-setup-guide.md) 참고:
1. 마이그레이션 007 실행
2. VAPID 키 생성 (`npx web-push generate-vapid-keys`)
3. Vercel 환경변수 5종 등록 (VAPID 2종, SUBJECT, CRON_SECRET, SERVICE_ROLE)
4. Vercel Cron 자동 활성화(vercel.json) — Pro 플랜은 매시간, Hobby는 일 1회 제한 주의

## SPEC.md FR-07, FR-11 완료

웹푸시 구독 + 예약 리마인더 자동 발송 — 완료.

## 다음

**Bolt 7 — 매출 통계 & 배포 마무리**: 대시보드 통계, Vercel 배포, PWA 최종 점검.
