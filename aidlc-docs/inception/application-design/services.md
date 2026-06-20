# Services — Bolt 1

---

## 1. AuthService

| 항목 | 내용 |
|------|------|
| **경로** | `lib/auth/authService.ts` |
| **책임** | Admin 인증 오케스트레이션 (로그인, 로그아웃, 세션 조회) |
| **의존성** | `createServerClient` (lib/supabase/server.ts) |

**역할:**
- Supabase Auth API 호출을 캡슐화
- 에러를 사용자 친화적 메시지로 변환 ([SECURITY-09]: 내부 상세 미노출)
- 세션 유효성 검사 로직 중앙 집중화

**보안 고려사항 [Security Extension]:**
- [SECURITY-12] 로그인 시 Supabase Auth 내장 브루트포스 보호 활용
- [SECURITY-12] 세션 쿠키는 Supabase SSR이 Secure/HttpOnly/SameSite 자동 설정
- [SECURITY-15] 모든 Supabase 호출에 try/catch, fail closed 원칙 적용

---

## 2. Supabase 클라이언트 팩토리

| 서비스 | 파일 | 사용 위치 |
|--------|------|-----------|
| Server Client | `lib/supabase/server.ts` | Server Components, Server Actions, Route Handlers |
| Browser Client | `lib/supabase/client.ts` | Client Components (싱글톤 패턴) |
| Middleware Client | `lib/supabase/middleware.ts` | `middleware.ts` 전용 |

**패키지:** `@supabase/ssr` (Next.js App Router 공식 지원)

**서버 클라이언트 패턴:**
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { /* get/set/remove */ } }
  )
}
```

**브라우저 클라이언트 패턴:**
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

---

## 3. Route Protection (middleware.ts)

| 항목 | 내용 |
|------|------|
| **파일** | `middleware.ts` (프로젝트 루트) |
| **책임** | `/admin/**` 라우트 보호, 세션 쿠키 갱신 |
| **의존성** | `lib/supabase/middleware.ts` |

**보호 규칙:**
```
/admin/login    → 공개 (인증 없이 접근 가능)
/admin/**       → 보호 (세션 없으면 /admin/login으로 리다이렉트)
/**             → (member) 라우트 — Bolt 4에서 보호 로직 추가
```

**[SECURITY-08] deny-by-default 원칙 적용:**
- 명시적으로 public으로 지정된 경로(`/admin/login`)를 제외한 모든 `/admin/**` 경로는 기본 차단
- 세션 만료 시 자동 갱신 (`@supabase/ssr` 미들웨어 헬퍼 활용)

---

## 4. 환경변수 관리

**필수 환경변수 (`.env.local`):**

```
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
```

**[SECURITY-12] 하드코딩 금지 원칙:**
- 모든 자격증명은 환경변수로 관리
- `.env.local`은 `.gitignore`에 포함
- `.env.local.example`을 버전 관리에 포함 (실제 값 없이 키 이름만)
