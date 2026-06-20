# Unit Test Execution — 전체 프로젝트

## 실행

```bash
pnpm test          # 1회 실행
pnpm test:watch    # 워치 모드
```

## 검증 결과 (실제 실행)

```
Test Files  17 passed (17)
     Tests  86 passed (86)
```

✅ **86/86 통과, 0 실패** — Supabase 연결 불필요 (순수 로직 대상)

## 테스트 파일 (tests/unit/)

| 파일 | 케이스 | 대상 |
|------|--------|------|
| `auth.validation.test.ts` | 5 | 로그인 Zod (SECURITY-05) |
| `rate-limit.test.ts` | 4 | 레이트리미터 (SECURITY-11) |
| `member.validation.test.ts` | 7 | 회원 Zod |
| `format.test.ts` | 6 | 전화번호/등급 포맷 |
| `slots.test.ts` | 8 | 예약 슬롯/주간 계산 |
| `treatment.validation.test.ts` | 5 | 시술 Zod |
| `appointment.validation.test.ts` | 5 | 예약 Zod |
| `recommend.test.ts` | 6 | 재방문 D-day |
| `visit.validation.test.ts` | 5 | 시술내역 Zod |
| `upload.test.ts` | 4 | 이미지 검증 |
| `booking.validation.test.ts` | 4 | 고객 예약 Zod |
| `booking-window.test.ts` | 5 | 예약 가능 범위(12주) |
| `onboarding.validation.test.ts` | 4 | 온보딩 Zod |
| `push.validation.test.ts` | 4 | 푸시 구독 Zod |
| `subscribe.test.ts` | 3 | VAPID 키 변환 |
| `aggregate.test.ts` | 5 | 통계 집계 |
| `month.test.ts` | 6 | 통계 월 유틸 |

## 실패 시
1. 출력에서 실패 케이스 확인
2. 해당 `lib/` 로직 수정
3. `pnpm test` 재실행
