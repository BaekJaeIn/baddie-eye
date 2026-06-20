# Application Design (통합) — Bolt 1

> 개별 상세 문서: components.md / component-methods.md / services.md / component-dependency.md

---

## 설계 결정 요약

| 항목 | 결정 |
|------|------|
| Admin 레이아웃 | 좌측 고정 사이드바 + 상단 헤더 |
| 메뉴 전략 | 구현된 항목만 표시 (Bolt마다 점진적 추가) |
| UI 라이브러리 | Tailwind CSS only |
| 라우팅 | `(admin)` / `(member)` route group 분리 |
| Supabase 클라이언트 | `@supabase/ssr` — server / browser / middleware 3종 분리 |
| 인증 미들웨어 | `middleware.ts` — deny-by-default, `/admin/login` 만 공개 |

---

## 컴포넌트 요약

| 컴포넌트 | 유형 | 책임 |
|----------|------|------|
| `AdminLayout` | Server | 사이드바 + 헤더 조합 레이아웃 래퍼 |
| `AdminSidebar` | Client | 네비게이션 메뉴, 현재 경로 하이라이팅 |
| `AdminHeader` | Client | 페이지 제목, 로그아웃 버튼 |
| `LoginForm` | Client | 이메일/비밀번호 폼, 입력 검증, 에러 표시 |

## 서비스 요약

| 서비스 | 위치 | 책임 |
|--------|------|------|
| `AuthService` | `lib/auth/authService.ts` | signIn / signOut / getSession |
| Server Client | `lib/supabase/server.ts` | 서버 컴포넌트용 Supabase |
| Browser Client | `lib/supabase/client.ts` | 클라이언트 컴포넌트용 Supabase |
| Middleware Client | `lib/supabase/middleware.ts` | 미들웨어 세션 갱신용 |
| Route Protection | `middleware.ts` | `/admin/**` 보호, 리다이렉트 |

---

## 프로젝트 폴더 구조 (Bolt 1)

```
baddie-eye/
├── app/
│   ├── (admin)/
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── actions.ts       # Server Action: loginAction
│   │   └── dashboard/
│   │       └── page.tsx
│   ├── (member)/                # Bolt 4+
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── admin/
│   │   ├── AdminLayout.tsx
│   │   ├── AdminSidebar.tsx
│   │   └── AdminHeader.tsx
│   └── auth/
│       └── LoginForm.tsx
├── lib/
│   ├── auth/
│   │   └── authService.ts
│   ├── supabase/
│   │   ├── server.ts
│   │   ├── client.ts
│   │   └── middleware.ts
│   └── utils.ts
├── types/
│   └── database.ts
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── middleware.ts
├── .env.local.example
└── package.json
```

---

## Security Compliance (Application Design 단계)

| 규칙 | 상태 | 비고 |
|------|------|------|
| SECURITY-01 (암호화) | N/A | 이 단계에서 인프라 미정의 — Code Generation/Infrastructure에서 검증 |
| SECURITY-02 (네트워크 로깅) | N/A | Vercel/Supabase 관리형 서비스 — CDN/LB 로깅은 플랫폼이 처리 |
| SECURITY-03 (앱 로깅) | 설계 반영 | AuthService 에러 로깅 구조 계획됨 |
| SECURITY-04 (HTTP 헤더) | 설계 반영 | NFR Design 단계에서 Next.js 미들웨어로 구현 예정 |
| SECURITY-05 (입력 검증) | 설계 반영 | LoginForm — 클라이언트 + 서버사이드 검증 계획 |
| SECURITY-06 (최소 권한) | N/A | Supabase RLS 정책 — Code Generation에서 SQL로 정의 |
| SECURITY-07 (네트워크 설정) | N/A | Supabase/Vercel 관리형 — 별도 네트워크 설정 없음 |
| SECURITY-08 (접근 제어) | 설계 반영 | middleware.ts deny-by-default 설계 완료 |
| SECURITY-09 (경화) | 설계 반영 | AuthService — generic 에러 메시지 반환 설계 |
| SECURITY-10 (공급망) | 설계 반영 | pnpm lock 파일 사용, 의존성 최소화 |
| SECURITY-11 (보안 설계) | 준수 | 인증/인가 로직 AuthService + middleware.ts에 집중 |
| SECURITY-12 (인증) | 설계 반영 | Supabase Auth 활용, 세션 쿠키 보안 속성 |
| SECURITY-13 (무결성) | N/A | 이 단계에서 해당 없음 |
| SECURITY-14 (모니터링) | N/A | Bolt 1 범위 초과 — 추후 Bolt에서 검토 |
| SECURITY-15 (예외 처리) | 설계 반영 | AuthService — try/catch, fail closed 원칙 |
