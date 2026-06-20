# Frontend Components — bolt-1-admin-auth

---

## LoginPage (`app/(admin)/login/page.tsx`)

| 항목 | 내용 |
|------|------|
| 유형 | Server Component |
| 접근 제한 | 공개 (미들웨어: 인증된 상태 → /admin/dashboard 리다이렉트) |
| 책임 | LoginForm 렌더링 |

**렌더링:**
```
<main class="min-h-screen flex items-center justify-center bg-gray-50">
  <div class="max-w-md w-full">
    <h1>Baddie Eye 관리자</h1>
    <LoginForm />
  </div>
</main>
```

---

## LoginForm (`components/auth/LoginForm.tsx`)

| 항목 | 내용 |
|------|------|
| 유형 | Client Component (`'use client'`) |
| 상태 | `error: string \| null`, `isLoading: boolean` |

**Props:** 없음

**UI 구성:**
```
<form>
  <label>이메일</label>
  <input type="email" name="email" required />

  <label>비밀번호</label>
  <input type="password" name="password" minLength={8} required />

  {error && <p class="text-red-500">{error}</p>}

  <button type="submit" disabled={isLoading}>
    {isLoading ? '로그인 중...' : '로그인'}
  </button>
</form>
```

**상호작용 흐름:**
1. 제출 → `isLoading = true`, `error = null`
2. `loginAction(formData)` Server Action 호출
3. 성공 → 서버에서 `/admin/dashboard`로 리다이렉트
4. 실패 → `error = "이메일 또는 비밀번호가 올바르지 않습니다"`, `isLoading = false`

**클라이언트 유효성 검사 [SECURITY-05]:**
- email: HTML5 `type="email"` + 빈 값 방지
- password: `minLength={8}` + 빈 값 방지

---

## app/(admin)/layout.tsx

| 항목 | 내용 |
|------|------|
| 유형 | Server Component |
| 책임 | AdminLayout으로 모든 /admin/* 페이지 래핑 |

```tsx
export default function AdminRootLayout({ children }) {
  return <AdminLayout>{children}</AdminLayout>
}
```

---

## AdminLayout (`components/admin/AdminLayout.tsx`)

| 항목 | 내용 |
|------|------|
| 유형 | Server Component |
| 책임 | 2열 레이아웃 (사이드바 + 메인 영역) |

**레이아웃 구조:**
```
<div class="flex h-screen bg-gray-100">
  <AdminSidebar />                          // 좌측 고정 사이드바
  <div class="flex flex-col flex-1 overflow-hidden">
    <AdminHeader title="..." />             // 상단 헤더
    <main class="flex-1 overflow-auto p-6">
      {children}
    </main>
  </div>
</div>
```

---

## AdminSidebar (`components/admin/AdminSidebar.tsx`)

| 항목 | 내용 |
|------|------|
| 유형 | Client Component (`'use client'`) |
| 책임 | 네비게이션 메뉴, 현재 경로 하이라이팅 |
| Hook | `usePathname()` (Next.js) |

**Bolt 1 네비게이션 항목:**
```typescript
const navItems = [
  { label: '대시보드', href: '/admin/dashboard' },
]
// Bolt 2: { label: '회원 관리', href: '/admin/members' } 추가
// Bolt 3: { label: '예약 관리', href: '/admin/appointments' } 추가
```

**UI 구성:**
```
<aside class="w-64 bg-white shadow-sm flex flex-col">
  <div class="p-6 border-b">
    <h1 class="text-xl font-bold">Baddie Eye</h1>
  </div>
  <nav class="flex-1 p-4">
    {navItems.map(item => (
      <Link href={item.href} class={isActive ? '활성 스타일' : '기본 스타일'}>
        {item.label}
      </Link>
    ))}
  </nav>
</aside>
```

---

## AdminHeader (`components/admin/AdminHeader.tsx`)

| 항목 | 내용 |
|------|------|
| 유형 | Client Component (`'use client'`) |
| Props | `title: string` |
| 책임 | 페이지 제목 + 로그아웃 버튼 |

**UI 구성:**
```
<header class="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
  <h2 class="text-lg font-semibold">{title}</h2>
  <button onClick={handleLogout}>
    로그아웃
  </button>
</header>
```

**로그아웃 처리:**
```typescript
async function handleLogout() {
  await logoutAction()  // Server Action → signOut() → redirect('/admin/login')
}
```

---

## DashboardPage (`app/(admin)/dashboard/page.tsx`)

| 항목 | 내용 |
|------|------|
| 유형 | Server Component |
| 접근 제한 | 인증 필요 (미들웨어 처리) |
| Bolt 1 콘텐츠 | 환영 메시지 + 빈 화면 |

**렌더링:**
```
<div>
  <h2>안녕하세요, 원장님!</h2>
  <p>회원·예약·시술 관리 기능은 다음 업데이트에서 추가될 예정입니다.</p>
</div>
```

---

## Server Actions (`app/(admin)/login/actions.ts`)

```typescript
'use server'

export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  // 1. 서버사이드 입력 추출 및 재검증 (SECURITY-05)
  // 2. AuthService.signIn(email, password) 호출
  // 3. 성공: redirect('/admin/dashboard')
  // 4. 실패: return { error: '이메일 또는 비밀번호가 올바르지 않습니다' }
}

export async function logoutAction(): Promise<void> {
  // 1. AuthService.signOut() 호출
  // 2. redirect('/admin/login')
}
```
