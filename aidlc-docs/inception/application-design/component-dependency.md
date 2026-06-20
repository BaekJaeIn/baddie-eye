# Component Dependencies — Bolt 1

## 의존성 매트릭스

| 컴포넌트/서비스 | 의존 대상 | 의존 유형 |
|-----------------|-----------|-----------|
| `middleware.ts` | `lib/supabase/middleware.ts` | 직접 의존 |
| `AdminLayout` | `AdminSidebar`, `AdminHeader` | 조합 |
| `AdminHeader` | `AuthService` | 로그아웃 호출 |
| `LoginForm` | `loginAction` (Server Action) | 폼 제출 |
| `loginAction` | `AuthService` | 인증 처리 |
| `AuthService` | `lib/supabase/server.ts` | Supabase 클라이언트 |
| `app/(admin)/layout.tsx` | `AdminLayout` | 레이아웃 래퍼 |
| `app/(admin)/dashboard/page.tsx` | `app/(admin)/layout.tsx` 상속 | 자동 레이아웃 적용 |

---

## 데이터 흐름 다이어그램

### 로그인 플로우

```
브라우저
  |
  | POST (form submit)
  v
LoginForm (Client Component)
  |
  | Server Action 호출
  v
loginAction (Server Action)
  |
  | signIn(email, password)
  v
AuthService
  |
  | signInWithPassword()
  v
Supabase Auth (외부)
  |
  | 성공: 세션 쿠키 설정
  | 실패: error 반환
  v
loginAction
  |
  | redirect('/admin/dashboard') 또는 error 반환
  v
LoginForm (에러 표시 or 리다이렉트)
```

### 인증된 페이지 접근 플로우

```
브라우저
  |
  | GET /admin/dashboard
  v
middleware.ts
  |
  | createMiddlewareClient()
  | supabase.auth.getUser()
  |-- 세션 없음 --> redirect('/admin/login')
  |-- 세션 있음 -->
  v
app/(admin)/layout.tsx
  |
  v
AdminLayout
  |-- AdminSidebar (네비게이션)
  |-- AdminHeader (제목 + 로그아웃)
  |-- children (대시보드 콘텐츠)
```

### 로그아웃 플로우

```
AdminHeader (Client Component)
  |
  | handleLogout()
  v
logoutAction (Server Action)
  |
  | AuthService.signOut()
  v
Supabase Auth
  |
  | 세션/쿠키 삭제
  v
redirect('/admin/login')
```

---

## 컴포넌트 계층 구조

```
app/
+-- layout.tsx (Root Layout)
    |
    +-- (admin)/
    |   +-- layout.tsx
    |       |-- AdminLayout
    |           |-- AdminSidebar
    |           +-- AdminHeader
    |               |
    |               +-- login/page.tsx     [공개]
    |               +-- dashboard/page.tsx [보호됨]
    |
    +-- (member)/                          [Bolt 4+]
        +-- page.tsx
```

---

## 결합도 원칙

| 원칙 | 적용 방법 |
|------|-----------|
| 느슨한 결합 | 컴포넌트는 `AuthService` 인터페이스에만 의존, Supabase SDK 직접 사용 금지 |
| 단일 책임 | 인증 로직 → `AuthService`, UI 로직 → 컴포넌트, 라우트 보호 → `middleware.ts` |
| 의존성 역전 | Server Action이 `AuthService`를 주입받는 구조, 테스트 시 교체 가능 |
| [SECURITY-11] 보안 관심사 분리 | 인증/인가 로직은 `AuthService` + `middleware.ts`에 집중, 컴포넌트에 분산 금지 |
