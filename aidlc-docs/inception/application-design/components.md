# Components — 속눈썹연장샵 회원관리 시스템 (Bolt 1)

## 설계 결정 사항

| 항목 | 결정 |
|------|------|
| Admin 레이아웃 | 좌측 고정 사이드바 + 상단 헤더 |
| 메뉴 전략 | 구현된 항목만 표시 (Bolt마다 점진적 추가) |
| UI 라이브러리 | Tailwind CSS only (shadcn/ui 미사용) |
| 라우팅 | Next.js App Router — `(admin)` / `(member)` route group |

---

## 컴포넌트 목록

### 1. AdminLayout

| 항목 | 내용 |
|------|------|
| **경로** | `components/admin/AdminLayout.tsx` |
| **유형** | Server Component (children만 전달, 상태 없음) |
| **책임** | 좌측 사이드바 + 상단 헤더를 포함하는 Admin 페이지 래퍼 |
| **사용 위치** | `app/(admin)/layout.tsx` |

**책임 상세:**
- `AdminSidebar`와 `AdminHeader`를 조합한 2열 레이아웃 제공
- `children`을 메인 콘텐츠 영역에 렌더링
- 레이아웃 구조만 담당, 인증 검사는 `middleware.ts`에서 처리

---

### 2. AdminSidebar

| 항목 | 내용 |
|------|------|
| **경로** | `components/admin/AdminSidebar.tsx` |
| **유형** | Client Component (active 상태, 경로 하이라이팅) |
| **책임** | Admin 좌측 네비게이션 메뉴 |
| **Bolt 1 메뉴** | 대시보드만 포함 |

**책임 상세:**
- 현재 Bolt에서 구현된 메뉴 항목만 표시 (점진적 추가 전략)
- 현재 활성 경로 하이라이팅
- 샵 브랜드명/로고 영역 포함

**Bolt별 메뉴 추가 계획:**
- Bolt 1: 대시보드
- Bolt 2: 회원 관리
- Bolt 3: 예약 관리, 시술 관리
- Bolt 6: 알림
- Bolt 7: 매출 통계

---

### 3. AdminHeader

| 항목 | 내용 |
|------|------|
| **경로** | `components/admin/AdminHeader.tsx` |
| **유형** | Client Component (로그아웃 버튼 상호작용) |
| **책임** | 상단 헤더 — 페이지 제목 + 로그아웃 버튼 |

**책임 상세:**
- 현재 페이지 제목 표시 (`title` prop)
- 로그아웃 버튼 → `AuthService.signOut()` 호출 후 `/admin/login`으로 리다이렉트
- 현재 로그인 이메일 표시 (옵션)

---

### 4. LoginForm

| 항목 | 내용 |
|------|------|
| **경로** | `components/auth/LoginForm.tsx` |
| **유형** | Client Component (form 상태, 제출 처리) |
| **책임** | 이메일 + 비밀번호 로그인 폼 |

**책임 상세:**
- 이메일, 비밀번호 입력 필드 및 유효성 검사
- 제출 시 Server Action 또는 API Route 호출
- 에러 메시지 표시 (잘못된 자격증명, 네트워크 오류 등)
- 로딩 상태 처리 (제출 중 버튼 비활성화)
- [SECURITY-05] 클라이언트사이드 입력 검증 (이메일 형식, 비밀번호 최소 길이)
- [SECURITY-09] 서버 에러 상세 미노출 (generic 에러 메시지)

---

## 프로젝트 폴더 구조

```
baddie-eye/
├── app/
│   ├── (admin)/
│   │   ├── layout.tsx              # Admin 셸 레이아웃 (AdminLayout 사용)
│   │   ├── login/
│   │   │   └── page.tsx            # 로그인 페이지 (공개)
│   │   └── dashboard/
│   │       └── page.tsx            # 대시보드 (인증 필요)
│   ├── (member)/                   # Bolt 4+ 구현
│   │   └── page.tsx
│   ├── globals.css
│   └── layout.tsx                  # 루트 레이아웃 (폰트, 메타데이터)
│
├── components/
│   ├── admin/
│   │   ├── AdminLayout.tsx
│   │   ├── AdminSidebar.tsx
│   │   └── AdminHeader.tsx
│   └── auth/
│       └── LoginForm.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── server.ts               # 서버 컴포넌트용 Supabase 클라이언트
│   │   ├── client.ts               # 브라우저용 Supabase 클라이언트
│   │   └── middleware.ts           # 미들웨어용 Supabase 헬퍼
│   └── utils.ts                    # 공통 유틸리티
│
├── types/
│   └── database.ts                 # Supabase 자동 생성 DB 타입
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # 초기 DB 스키마
│
├── middleware.ts                   # Next.js 라우트 보호 미들웨어
├── .env.local.example              # 환경변수 템플릿
└── ...
```
