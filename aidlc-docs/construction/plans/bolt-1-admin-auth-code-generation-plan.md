# Code Generation Plan — bolt-1-admin-auth

> 이 계획은 Code Generation 단계의 단일 진실 공급원(single source of truth)입니다.
> 각 단계 완료 시 즉시 [x]로 체크합니다.

## 단위 컨텍스트

| 항목 | 내용 |
|------|------|
| Unit | bolt-1-admin-auth |
| 프로젝트 유형 | Greenfield, 단일 단위 |
| 워크스페이스 루트 | d:\백재인\스터디\baddie-eye |
| 코드 위치 | 워크스페이스 루트 (aidlc-docs/ 절대 금지) |
| 문서 위치 | aidlc-docs/construction/bolt-1-admin-auth/code/ (마크다운 요약만) |

## 구현 기능 (요구사항 추적)

| 요구사항 ID | 내용 | 단계 |
|-------------|------|------|
| FR-B1-01 | Next.js + TS + Tailwind 초기화 | Step 1 |
| FR-B1-02 | Supabase 클라이언트 설정 | Step 3 |
| FR-B1-03 | DB 스키마 마이그레이션 | Step 2 |
| FR-B1-04 | Admin 이메일/비밀번호 로그인 | Step 5, 6 |
| FR-B1-05 | /admin/** 라우트 보호 미들웨어 | Step 4 |
| FR-B1-06 | Admin 로그인 폼 UI | Step 6 |
| FR-B1-07 | Admin 대시보드 레이아웃 셸 | Step 7 |
| FR-B1-08 | 로그아웃 | Step 5, 7 |

---

## 실행 단계

### Step 1: 프로젝트 구조 셋업
- [x] `package.json` — pnpm, Next.js 14+, 의존성 전체
- [x] `tsconfig.json` — TypeScript strict mode
- [x] `next.config.ts` — HTTP 보안 헤더 (CSP, HSTS 등) [SECURITY-04]
- [x] `tailwind.config.ts`, `postcss.config.mjs`
- [x] `app/globals.css` — Tailwind 디렉티브
- [x] `app/layout.tsx` — 루트 레이아웃 (폰트, 메타데이터)
- [x] `.gitignore` — .env.local 포함 [SECURITY-12]
- [x] `.env.local.example` — 환경변수 템플릿
- [x] `.eslintrc.json`, `.prettierrc`
- [x] `README.md` — 셋업 가이드

### Step 2: DB 마이그레이션 스크립트
- [x] `supabase/migrations/001_initial_schema.sql` — 4개 테이블 + 인덱스 + RLS 정책 [SECURITY-06]
- [x] `types/database.ts` — TypeScript 타입 정의

### Step 3: Supabase 클라이언트 + 검증 스키마
- [x] `lib/supabase/server.ts` — 서버 클라이언트
- [x] `lib/supabase/client.ts` — 브라우저 클라이언트
- [x] `lib/supabase/middleware.ts` — 미들웨어 헬퍼
- [x] `lib/validations/auth.ts` — Zod 로그인 스키마 [SECURITY-05]
- [x] `lib/rate-limit.ts` — 레이트리미터 [SECURITY-11]

### Step 4: 라우트 보호 미들웨어
- [x] `middleware.ts` — deny-by-default, /admin/login 공개 [SECURITY-08]

### Step 5: 인증 서비스 + Server Actions
- [x] `lib/auth/authService.ts` — signIn/signOut/getSession [SECURITY-09, 15]
- [x] `app/admin/login/actions.ts` — loginAction, logoutAction

### Step 6: 로그인 화면
- [x] `app/admin/login/page.tsx` — 로그인 페이지 (셸 없음)
- [x] `components/auth/LoginForm.tsx` — 폼 (data-testid 포함)

### Step 7: Admin 셸 + 대시보드
- [x] `app/admin/(protected)/layout.tsx` — 보호 영역 셸 적용
- [x] `app/page.tsx` — `/` → `/admin/login` 리다이렉트 (추가)
- [x] `components/admin/AdminLayout.tsx`
- [x] `components/admin/AdminSidebar.tsx`
- [x] `components/admin/AdminHeader.tsx` — 로그아웃 버튼
- [x] `app/admin/(protected)/dashboard/page.tsx` — 환영 대시보드

> 구조 변경: route group `(admin)`은 URL에서 제외되므로 `/admin/*` URL 확보 위해 실제 `app/admin/` 폴더 사용. 로그인은 `(protected)` 밖에 두어 셸 없이 렌더.

### Step 8: 에러 추적 + 에러 바운더리
- [x] `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` [SECURITY-03]
- [x] `instrumentation.ts`
- [x] `app/error.tsx`, `app/global-error.tsx` [SECURITY-15]

### Step 9: 테스트 코드
- [x] `vitest.config.ts`, `vitest.setup.ts`
- [x] `tests/unit/auth.validation.test.ts` — Zod 스키마 단위 테스트
- [x] `tests/unit/rate-limit.test.ts` — 레이트리미터 단위 테스트
- [x] `playwright.config.ts`
- [x] `tests/e2e/admin-auth.spec.ts` — 로그인/로그아웃/보호 E2E

### Step 10: 문서화
- [x] `aidlc-docs/construction/bolt-1-admin-auth/code/code-summary.md` — 생성 코드 요약
- [x] `aidlc-docs/construction/bolt-1-admin-auth/code/setup-guide.md` — Supabase 셋업 단계별 가이드

---

## 의존성 및 외부 설정 필요사항

| 항목 | 사용자 작업 필요 |
|------|------------------|
| Supabase 프로젝트 | 대시보드에서 신규 생성 → URL/anon key를 .env.local에 입력 |
| Admin 계정 | Supabase Auth 대시보드에서 수동 생성 (이메일/비밀번호) |
| DB 마이그레이션 | Supabase SQL Editor에서 001_initial_schema.sql 실행 |
| Sentry (선택) | 프로젝트 생성 후 DSN 입력 (없으면 비활성 동작) |

> 이 작업들은 Build and Test 단계의 setup-guide.md에서 상세 안내합니다.

---

## 예상 규모

- **총 10단계**, 약 35개 파일 생성
- 애플리케이션 코드: 워크스페이스 루트
- 문서: aidlc-docs/construction/bolt-1-admin-auth/code/
