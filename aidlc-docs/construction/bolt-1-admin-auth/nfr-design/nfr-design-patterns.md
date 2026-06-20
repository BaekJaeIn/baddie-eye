# NFR Design Patterns — bolt-1-admin-auth

> NFR Requirements에서 정의한 비기능 요구사항을 실제 설계 패턴으로 구체화합니다.

---

## 1. 보안 패턴 (Security Patterns)

### 1.1 Deny-by-Default 접근 제어 [SECURITY-08]

**패턴**: Middleware Gateway

```
모든 /admin/* 요청 → middleware.ts (단일 진입점)
  → 화이트리스트(/admin/login)만 통과
  → 나머지는 세션 검증 후 통과/리다이렉트
```

**구현 위치**: `middleware.ts` + `config.matcher = ['/admin/:path*']`

**핵심 원칙**:
- 공개 경로를 명시적으로 나열 (`PUBLIC_ADMIN_PATHS = ['/admin/login']`)
- 명시되지 않은 모든 경로는 기본 차단
- 클라이언트 사이드 라우팅 우회 불가 (서버 미들웨어 레벨)

---

### 1.2 HTTP 보안 헤더 [SECURITY-04]

**패턴**: Response Header Injection (정적 설정)

**구현 위치**: `next.config.ts`의 `headers()` 함수

| 헤더 | 값 |
|------|-----|
| `Content-Security-Policy` | `default-src 'self'; img-src 'self' data: https://*.supabase.co; connect-src 'self' https://*.supabase.co https://*.sentry.io; style-src 'self' 'unsafe-inline'` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |

**CSP 주의사항**:
- `style-src 'unsafe-inline'`은 Tailwind/Next.js 인라인 스타일 때문에 불가피 — 문서화된 예외
- Supabase, Sentry 도메인을 `connect-src`에 명시적 허용
- `script-src`는 `'self'`만 (인라인 스크립트 금지)

---

### 1.3 입력 검증 패턴 [SECURITY-05]

**패턴**: Schema-First Validation (Zod)

```
[클라이언트] HTML5 검증 (1차, UX용)
     ↓
[Server Action] Zod 스키마 검증 (2차, 신뢰 경계)
     ↓
[AuthService] 검증된 데이터만 수신
```

**핵심 원칙**:
- 클라이언트 검증은 UX 보조일 뿐, 신뢰하지 않음
- 서버 사이드 Zod 검증이 진짜 신뢰 경계
- 검증 스키마는 `lib/validations/auth.ts`에 중앙 집중

```typescript
// lib/validations/auth.ts
export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
})
```

---

### 1.4 에러 경화 패턴 [SECURITY-09, SECURITY-15]

**패턴**: Fail-Closed + Generic Error Response

```
try {
  await supabase.auth.signInWithPassword(...)
} catch (error) {
  // 1. 상세 에러는 Sentry로만 (서버 사이드)
  Sentry.captureException(error)
  // 2. 사용자에게는 generic 메시지
  return { error: '이메일 또는 비밀번호가 올바르지 않습니다' }
}
```

**핵심 원칙**:
- 인증 실패 시 "이메일 없음" vs "비밀번호 틀림" 구분 노출 금지 (계정 열거 공격 방지)
- 스택 트레이스/내부 경로는 프로덕션 응답에서 절대 노출 안 함
- 에러 발생 시 항상 안전한 기본값으로 처리 (fail-closed)

---

### 1.5 레이트 리미팅 패턴 [SECURITY-11]

**패턴**: In-Memory Sliding Window (Bolt 1 단순 버전)

**구현 위치**: `lib/rate-limit.ts` + 로그인 Server Action

```
로그인 시도 → IP/이메일 기준 카운트
  → 5분 내 5회 초과 시 차단
  → "잠시 후 다시 시도해주세요" 반환
```

**Bolt 1 범위 결정**:
- 단일 인스턴스 in-memory 레이트리밋으로 시작 (1인 운영, 트래픽 낮음)
- Supabase Auth 자체 브루트포스 보호와 이중 방어
- **향후**: 멀티 인스턴스 확장 시 Upstash Redis 기반으로 전환 검토

---

### 1.6 시크릿 관리 패턴 [SECURITY-12]

**패턴**: Environment Variable Injection

| 시크릿 | 노출 범위 | 관리 |
|--------|-----------|------|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 클라이언트 OK (RLS로 보호) | `.env.local` |
| `NEXT_PUBLIC_SUPABASE_URL` | 클라이언트 OK | `.env.local` |
| `SENTRY_AUTH_TOKEN` | **서버 전용** (절대 클라이언트 금지) | CI/CD 환경변수 |

**핵심 원칙**:
- `NEXT_PUBLIC_` 접두사는 클라이언트 번들 포함 = 공개 가능한 값만
- 민감 토큰은 접두사 없이 서버 전용
- `.env.local`은 `.gitignore`, `.env.local.example`만 커밋

---

## 2. 관찰가능성 패턴 (Observability Patterns)

### 2.1 구조화 로깅 + 에러 추적 [SECURITY-03]

**패턴**: Centralized Error Boundary (Sentry)

```
[클라이언트 에러] → Sentry Browser SDK → beforeSend(PII 마스킹) → Sentry
[서버 에러]      → Sentry Node SDK    → beforeSend(PII 마스킹) → Sentry
[전역 미처리]    → Next.js error.tsx / global-error.tsx → Sentry
```

**PII 마스킹 규칙** (`sentry.*.config.ts`의 `beforeSend`):
- 이메일 → `user@***`
- 전화번호 → 마스킹
- 비밀번호/토큰 → 완전 제거
- `environment === 'development'`면 전송 안 함

---

## 3. 성능 패턴 (Performance Patterns)

### 3.1 서버 컴포넌트 우선 (RSC-First)

**패턴**: React Server Components 기본, Client Component 최소화

| 컴포넌트 | 유형 | 이유 |
|----------|------|------|
| 페이지/레이아웃 | Server | 초기 로드 최적화, JS 번들 감소 |
| LoginForm, AdminSidebar, AdminHeader | Client | 상호작용 필요 (form, onClick, usePathname) |

### 3.2 DB 인덱싱 전략

| 테이블 | 인덱스 | 이유 |
|--------|--------|------|
| `members` | `phone` (UNIQUE) | 연락처 조회/중복 검사 |
| `appointments` | `member_id`, `scheduled_at` | 회원별/날짜별 예약 조회 (Bolt 3) |
| `visit_history` | `member_id`, `visited_at` | 회원별 시술 히스토리 (Bolt 4) |

> Bolt 1에서 마이그레이션에 인덱스를 미리 정의하여 후속 Bolt 성능 확보

---

## 4. 패턴 적용 매트릭스

| NFR | 패턴 | 구현 위치 |
|-----|------|-----------|
| 접근 제어 | Middleware Gateway | `middleware.ts` |
| HTTP 헤더 | Response Header Injection | `next.config.ts` |
| 입력 검증 | Schema-First (Zod) | `lib/validations/` |
| 에러 경화 | Fail-Closed + Generic | Server Actions |
| 레이트리밋 | In-Memory Sliding Window | `lib/rate-limit.ts` |
| 시크릿 | Env Var Injection | `.env.local` |
| 에러 추적 | Centralized Boundary (Sentry) | `sentry.*.config.ts` |
| 성능 | RSC-First + DB 인덱싱 | 전반 |
