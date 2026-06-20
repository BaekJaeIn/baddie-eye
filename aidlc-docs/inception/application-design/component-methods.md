# Component Methods — Bolt 1

> 상세 비즈니스 로직은 CONSTRUCTION 단계 Functional Design에서 정의됩니다.
> 이 문서는 메서드 시그니처와 역할을 정의합니다.

---

## AdminLayout

| 메서드/함수 | 시그니처 | 역할 |
|-------------|----------|------|
| `AdminLayout` | `({ children }: { children: React.ReactNode }) => JSX.Element` | 사이드바 + 헤더 + 콘텐츠 영역 레이아웃 조합 |

---

## AdminSidebar

| 메서드/함수 | 시그니처 | 역할 |
|-------------|----------|------|
| `AdminSidebar` | `() => JSX.Element` | 네비게이션 메뉴 렌더링. `usePathname()`으로 현재 경로 감지 |

**네비게이션 항목 타입:**
```typescript
type NavItem = {
  label: string
  href: string
  icon?: React.ReactNode
}
```

---

## AdminHeader

| 메서드/함수 | 시그니처 | 역할 |
|-------------|----------|------|
| `AdminHeader` | `({ title }: { title: string }) => JSX.Element` | 페이지 제목 + 로그아웃 버튼 렌더링 |
| `handleLogout` | `() => Promise<void>` | 로그아웃 Server Action 호출 후 `/admin/login` 리다이렉트 |

---

## LoginForm

| 메서드/함수 | 시그니처 | 역할 |
|-------------|----------|------|
| `LoginForm` | `() => JSX.Element` | 이메일/비밀번호 폼 렌더링, 제출 처리 |
| `handleSubmit` | `(e: FormEvent) => Promise<void>` | 폼 제출 → Server Action 호출 → 결과 처리 |

**Server Action:**
```typescript
// app/(admin)/login/actions.ts
async function loginAction(formData: FormData): Promise<{ error?: string }>
```

---

## AuthService (`lib/auth/authService.ts`)

| 메서드 | 시그니처 | 역할 |
|--------|----------|------|
| `signIn` | `(email: string, password: string): Promise<{ error?: string }>` | Supabase Auth 이메일/비밀번호 로그인 |
| `signOut` | `(): Promise<void>` | 세션 만료 + 쿠키 삭제 |
| `getSession` | `(): Promise<Session \| null>` | 현재 서버사이드 세션 조회 |

---

## Supabase 클라이언트 팩토리 (`lib/supabase/`)

| 함수 | 시그니처 | 역할 | 파일 |
|------|----------|------|------|
| `createServerClient` | `() => SupabaseClient` | 서버 컴포넌트/Server Action용 클라이언트 | `server.ts` |
| `createBrowserClient` | `() => SupabaseClient` | 클라이언트 컴포넌트용 브라우저 클라이언트 (싱글톤) | `client.ts` |
| `createMiddlewareClient` | `(request: NextRequest) => { supabase: SupabaseClient, response: NextResponse }` | `middleware.ts`에서 세션 갱신용 | `middleware.ts` |

---

## Middleware (`middleware.ts`)

| 함수 | 시그니처 | 역할 |
|------|----------|------|
| `middleware` | `(request: NextRequest) => Promise<NextResponse>` | `/admin/**` 보호, 세션 갱신, 미인증 리다이렉트 |

**라우트 매처:**
```typescript
export const config = {
  matcher: ['/admin/:path*']
}
```

**로직 요약:**
1. `createMiddlewareClient`로 Supabase 클라이언트 생성
2. `supabase.auth.getUser()` 호출 (세션 갱신 포함)
3. `/admin/login`은 인증 없이 통과
4. 기타 `/admin/**`에서 세션 없으면 `/admin/login`으로 리다이렉트
5. 이미 로그인 상태로 `/admin/login` 접근 시 `/admin/dashboard`로 리다이렉트
