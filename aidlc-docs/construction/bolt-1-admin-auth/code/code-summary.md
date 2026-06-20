# Code Summary — bolt-1-admin-auth

> 생성된 애플리케이션 코드 요약. 실제 코드는 워크스페이스 루트에 위치.

## 생성 파일 목록

### 프로젝트 설정 (Step 1)
| 파일 | 역할 |
|------|------|
| `package.json` | pnpm, Next.js 14, 의존성 |
| `tsconfig.json` | TypeScript strict mode, `@/*` 별칭 |
| `next.config.ts` | HTTP 보안 헤더 [SECURITY-04] |
| `tailwind.config.ts` | Tailwind + brand 컬러 |
| `postcss.config.mjs` | PostCSS |
| `app/globals.css` | Tailwind 디렉티브, 한글 폰트 |
| `app/layout.tsx` | 루트 레이아웃 (lang="ko") |
| `app/page.tsx` | `/` → `/admin/login` 리다이렉트 |
| `.gitignore` | .env.local 제외 [SECURITY-12] |
| `.env.local.example` | 환경변수 템플릿 |
| `.eslintrc.json`, `.prettierrc` | 린트/포맷 |
| `README.md` | 셋업 가이드 |

### DB (Step 2)
| 파일 | 역할 |
|------|------|
| `supabase/migrations/001_initial_schema.sql` | 4개 테이블 + 인덱스 + RLS [SECURITY-06] |
| `types/database.ts` | TypeScript 도메인 타입 |

### Supabase 클라이언트 + 검증 (Step 3)
| 파일 | 역할 |
|------|------|
| `lib/supabase/server.ts` | 서버 클라이언트 |
| `lib/supabase/client.ts` | 브라우저 클라이언트 |
| `lib/supabase/middleware.ts` | 미들웨어 헬퍼 |
| `lib/validations/auth.ts` | Zod 로그인 스키마 [SECURITY-05] |
| `lib/rate-limit.ts` | In-memory 레이트리미터 [SECURITY-11] |

### 인증 (Step 4, 5)
| 파일 | 역할 |
|------|------|
| `middleware.ts` | deny-by-default 라우트 보호 [SECURITY-08] |
| `lib/auth/authService.ts` | signIn/signOut/getSession [SECURITY-09,15] |
| `app/admin/login/actions.ts` | loginAction, logoutAction |

### 화면 (Step 6, 7)
| 파일 | 역할 |
|------|------|
| `app/admin/login/page.tsx` | 로그인 페이지 (셸 없음) |
| `components/auth/LoginForm.tsx` | 로그인 폼 (data-testid 포함) |
| `app/admin/(protected)/layout.tsx` | 보호 영역 셸 적용 |
| `app/admin/(protected)/dashboard/page.tsx` | 대시보드 |
| `components/admin/AdminLayout.tsx` | 사이드바+헤더 레이아웃 |
| `components/admin/AdminSidebar.tsx` | 네비게이션 |
| `components/admin/AdminHeader.tsx` | 제목+로그아웃 |

### 에러 추적 (Step 8)
| 파일 | 역할 |
|------|------|
| `sentry.client/server/edge.config.ts` | Sentry 초기화 (DSN 없으면 비활성) |
| `lib/sentry-pii.ts` | PII 마스킹 [SECURITY-03] |
| `instrumentation.ts` | Next.js 계측 등록 |
| `app/error.tsx`, `app/global-error.tsx` | 에러 바운더리 [SECURITY-15] |

### 테스트 (Step 9)
| 파일 | 역할 |
|------|------|
| `vitest.config.ts`, `vitest.setup.ts` | Vitest 설정 |
| `tests/unit/auth.validation.test.ts` | Zod 스키마 단위 테스트 (5케이스) |
| `tests/unit/rate-limit.test.ts` | 레이트리미터 단위 테스트 (4케이스) |
| `playwright.config.ts` | Playwright 설정 |
| `tests/e2e/admin-auth.spec.ts` | 로그인/보호/로그아웃 E2E (4시나리오) |

## 라우팅 구조

```
/                          → /admin/login 리다이렉트
/admin/login               → 로그인 (공개, 셸 없음)
/admin/dashboard           → 대시보드 (보호, 셸 적용)
```

route group `(protected)`로 로그인 페이지와 보호 페이지의 레이아웃을 분리.
`/admin/**` URL을 위해 실제 `app/admin/` 폴더 사용 (route group 괄호는 URL 미반영).

## 설계 대비 변경 사항

| 변경 | 이유 |
|------|------|
| `app/(admin)/` → `app/admin/(protected)/` | route group은 URL에서 제외되므로 `/admin/*` URL 확보 위해 실제 폴더 필요 |
| 로그인 페이지를 (protected) 밖으로 | 로그인 화면은 사이드바/헤더 없이 렌더해야 함 |
| `lib/sentry-pii.ts` 추가 | PII 마스킹 로직을 3개 Sentry 설정에서 공유 |

## 보안 규칙 적용 현황

SECURITY-03, 04, 05, 08, 09, 11, 12, 15 — 코드로 구현 완료.
SECURITY-01(TLS), 06(RLS), 10(lock) — 인프라/설정 레벨, 셋업 가이드에서 검증.
