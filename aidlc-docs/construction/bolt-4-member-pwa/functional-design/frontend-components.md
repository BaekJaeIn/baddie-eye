# Frontend Components — bolt-4-member-pwa

## 라우트 구조

```
app/
├── (member)/                       # 고객 영역 (모바일 우선)
│   ├── layout.tsx                  # 고객 셸 (간단한 모바일 헤더)
│   ├── login/
│   │   └── page.tsx                # 카카오 로그인
│   ├── onboarding/
│   │   ├── page.tsx                # 전화번호 입력 (연결)
│   │   └── actions.ts              # connectMemberAction
│   └── me/
│       ├── page.tsx                # 마이페이지
│       └── actions.ts              # logoutMemberAction
├── auth/
│   └── callback/
│       └── route.ts                # OAuth 콜백 핸들러 (code → 세션)
└── (수정) layout.tsx                # manifest 링크 + PWA 메타

public/
├── manifest.json
├── sw.js                           # service worker
├── icon-192.png                    # placeholder
└── icon-512.png                    # placeholder

components/
├── member/
│   ├── KakaoLoginButton.tsx
│   ├── OnboardingForm.tsx
│   ├── MemberHeader.tsx
│   └── MyVisitHistory.tsx
└── pwa/
    └── ServiceWorkerRegister.tsx
```

> 고객 영역은 `(member)` route group으로 URL에 그룹명 안 들어감.
> `/login`, `/onboarding`, `/me` 가 고객용. (Admin은 `/admin/*`)

---

## 미들웨어 수정 (`middleware.ts`)

Bolt 1 미들웨어는 `/admin/*`만 처리. 고객 경로 추가:
```
matcher: ['/admin/:path*', '/me/:path*', '/onboarding/:path*']

규칙:
- /me, /onboarding → 미인증 시 /login 리다이렉트
- /me → 인증됐으나 미연결 시 /onboarding (페이지에서 처리)
- /admin/* → 기존 Bolt 1 로직
```

---

## 컴포넌트 상세

### KakaoLoginButton (`components/member/KakaoLoginButton.tsx`)
- Client Component
- `supabase.auth.signInWithOAuth({ provider: 'kakao', options: { redirectTo: /auth/callback } })`
- `data-testid="kakao-login-button"`

### LoginPage (`(member)/login/page.tsx`)
- 카카오 로그인 버튼 + 샵 소개
- 이미 로그인 상태면 /me로

### OAuth Callback (`app/auth/callback/route.ts`)
- Route Handler. `code`를 세션으로 교환 (exchangeCodeForSession)
- 성공 → /me (페이지에서 연결 여부 판단)

### OnboardingForm (`components/member/OnboardingForm.tsx`)
- Client Component. 전화번호 입력.
- connectMemberAction 호출
- `data-testid`: `onboarding-form`, `onboarding-phone-input`, `onboarding-submit`, `onboarding-error`

### OnboardingPage (`(member)/onboarding/page.tsx`)
- 이미 연결된 회원이면 /me로
- OnboardingForm 렌더

### MyPage (`(member)/me/page.tsx`)
- Server Component
- 내 members(user_id) 조회 → 없으면 /onboarding
- 내 visit_history + member_last_visit 조회
- MemberHeader + 정보 카드(등급/포인트) + MyVisitHistory

### MemberHeader (`components/member/MemberHeader.tsx`)
- Client Component. 이름 + 로그아웃 버튼.
- 모바일 우선 디자인

### MyVisitHistory (`components/member/MyVisitHistory.tsx`)
- 시술 히스토리 (날짜/시술명/사진 썸네일) — 읽기 전용
- VisitHistoryList(Admin) 재사용 가능하나 편집 링크 없는 버전

### ServiceWorkerRegister (`components/pwa/ServiceWorkerRegister.tsx`)
- Client Component. 프로덕션에서 SW 등록.
- useEffect로 navigator.serviceWorker.register('/sw.js')
- 루트 layout에 포함

---

## Server Actions

### connectMemberAction (`(member)/onboarding/actions.ts`)
```typescript
'use server'
// 1. 세션 확인 (auth.uid())
// 2. Zod 전화번호 검증
// 3. members에서 phone 매칭 + user_id IS NULL → 연결 [BR-MB-04]
// 4. 없으면 신규 생성 [BR-MB-05]
// 5. 이미 연결된 번호 → 에러 [BR-MB-06]
// 6. /me 리다이렉트
connectMemberAction(prev, formData): Promise<{ error?: string }>
```

### logoutMemberAction (`(member)/me/actions.ts`)
```typescript
'use server'
// supabase.auth.signOut() → /login
logoutMemberAction(): Promise<void>
```

---

## PWA 파일

### public/manifest.json
```json
{
  "name": "Baddie Eye",
  "short_name": "BaddieEye",
  "start_url": "/me",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#d6336c",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### public/sw.js
- install: skipWaiting
- activate: clients.claim
- fetch: 네트워크 우선 (오프라인 캐싱 최소)

### app/layout.tsx 수정
- `<link rel="manifest" href="/manifest.json">`
- `<meta name="theme-color" content="#d6336c">`
- apple-touch-icon
- ServiceWorkerRegister 포함

---

## 데이터 타입 수정

`types/database.ts`: Member에 `user_id: string | null` 추가.
