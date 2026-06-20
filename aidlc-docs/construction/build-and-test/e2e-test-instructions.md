# E2E Test Instructions — 전체 프로젝트

## 실행

```bash
npx playwright install chromium   # 최초 1회
pnpm test:e2e
```

## E2E 스펙 파일 (tests/e2e/)

| 파일 | 대상 |
|------|------|
| `admin-auth.spec.ts` | Admin 로그인/보호/로그아웃 |
| `member-management.spec.ts` | 회원 관리 보호 + 등록 |
| `booking.spec.ts` | Admin 예약/시술 보호 |
| `visits.spec.ts` | 시술 내역 보호 |
| `member.spec.ts` | 고객 영역 보호 + 카카오 버튼 + manifest |
| `member-booking.spec.ts` | 고객 예약 보호 + 슬롯 API 401 |
| `cron.spec.ts` | Cron 시크릿 인증 401 |
| `stats.spec.ts` | 통계 보호 |

## 자격증명 없이 실행 가능한 검증

대부분 스펙은 **미인증 보호 흐름**을 검증하므로 Supabase 계정 없이 통과:
- 보호 라우트 → 로그인 리다이렉트
- API 인증 (slots 401, cron 401)
- manifest.json 제공
- 공개 페이지 렌더링 (로그인 폼, 카카오 버튼)

## 자격증명 필요 시나리오 (자동 skip)

`E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` 환경변수 설정 시 추가 실행:
- 로그인 → 대시보드 → 로그아웃
- 회원 관리 진입, 예약 캘린더 진입, 시술 내역 진입

미설정 시 `test.skip`으로 자동 건너뜀.

## 보안 검증 매핑

| 검증 | 스펙 | 규칙 |
|------|------|------|
| deny-by-default 보호 | 전체 보호 라우트 | SECURITY-08 |
| 계정 열거 방지 | admin-auth 시나리오 3 | SECURITY-09 |
| API 인증 | slots/cron 401 | SECURITY-08 |
| 입력 검증 | 폼 클라이언트 검증 | SECURITY-05 |

## 주의
E2E는 개발 서버를 자동 기동(playwright.config webServer)한다.
실제 데이터 흐름(로그인 후)은 Supabase 연결 + 테스트 계정 필요 → 사용자 환경에서 실행.
