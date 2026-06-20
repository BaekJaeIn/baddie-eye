# Logical Components — bolt-1-admin-auth

> NFR 패턴을 구현하는 논리적 컴포넌트(코드 모듈)를 정의합니다.
> 이는 Application Design의 기능 컴포넌트에 더해, NFR을 충족하는 횡단 관심사 모듈입니다.

---

## 횡단 관심사 컴포넌트 (Cross-Cutting Components)

### 1. RateLimiter (`lib/rate-limit.ts`)

| 항목 | 내용 |
|------|------|
| 목적 | 로그인 브루트포스 방어 [SECURITY-11] |
| 유형 | In-memory sliding window (Bolt 1) |
| 인터페이스 | `checkRateLimit(key: string): { allowed: boolean; retryAfter?: number }` |

```typescript
// 단순 in-memory 구현 (단일 인스턴스 가정)
interface RateLimitEntry {
  attempts: number[]   // 타임스탬프 배열
}

const WINDOW_MS = 5 * 60 * 1000  // 5분
const MAX_ATTEMPTS = 5

export function checkRateLimit(key: string): { allowed: boolean; retryAfter?: number }
```

**주의**: 서버리스(Vercel) 환경에서 인스턴스 간 메모리 공유 안 됨. Bolt 1에서는 Supabase Auth 자체 보호와 이중 방어로 수용. 트래픽 증가 시 Upstash Redis로 전환.

---

### 2. Validation Schemas (`lib/validations/auth.ts`)

| 항목 | 내용 |
|------|------|
| 목적 | 입력 검증 중앙화 [SECURITY-05] |
| 유형 | Zod 스키마 |
| 익스포트 | `loginSchema`, `LoginInput` (추론 타입) |

```typescript
export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
})
export type LoginInput = z.infer<typeof loginSchema>
```

---

### 3. Sentry 설정 모듈

| 파일 | 역할 |
|------|------|
| `sentry.client.config.ts` | 브라우저 에러 캡처 + PII 마스킹 |
| `sentry.server.config.ts` | 서버 에러 캡처 + PII 마스킹 |
| `sentry.edge.config.ts` | 미들웨어/엣지 에러 캡처 |
| `instrumentation.ts` | Next.js 계측 등록 |

**공통 `beforeSend` 훅** [SECURITY-03]:
```typescript
beforeSend(event) {
  if (process.env.NODE_ENV === 'development') return null
  // PII 마스킹: 이메일, 전화번호, 토큰 제거
  return maskPII(event)
}
```

---

### 4. Error Boundaries (Next.js)

| 파일 | 역할 |
|------|------|
| `app/error.tsx` | 페이지 레벨 에러 UI + Sentry 보고 |
| `app/global-error.tsx` | 루트 레이아웃 에러 (최후 방어선) [SECURITY-15] |
| `app/(admin)/error.tsx` | Admin 영역 전용 에러 UI |

**핵심 원칙**: 모든 미처리 예외를 캐치 → Sentry 보고 → 사용자에게 generic UI 표시 (fail-closed)

---

### 5. Security Headers (`next.config.ts`)

| 항목 | 내용 |
|------|------|
| 목적 | HTTP 보안 헤더 일괄 적용 [SECURITY-04] |
| 유형 | 정적 헤더 설정 |
| 적용 범위 | 모든 라우트 (`source: '/:path*'`) |

---

## 컴포넌트 통합 다이어그램

```
                    [브라우저 요청]
                          |
                          v
         +----------------------------------+
         |  next.config.ts (보안 헤더 주입)  |  ← SECURITY-04
         +----------------------------------+
                          |
                          v
         +----------------------------------+
         |  middleware.ts (Gateway)         |  ← SECURITY-08
         |  - 세션 검증                      |
         |  - Sentry edge config            |
         +----------------------------------+
                          |
          +---------------+---------------+
          |                               |
          v                               v
   [/admin/login]                  [/admin/dashboard]
          |                               |
          v                               v
   +-------------+                 +-------------+
   | LoginForm   |                 | AdminLayout |
   | (Client)    |                 | (Server)    |
   +-------------+                 +-------------+
          |
          | loginAction (Server Action)
          v
   +--------------------------------------+
   | 1. RateLimiter.checkRateLimit()      |  ← SECURITY-11
   | 2. loginSchema.parse() (Zod)         |  ← SECURITY-05
   | 3. AuthService.signIn()              |
   |    - try/catch (fail-closed)         |  ← SECURITY-15
   |    - Sentry.captureException()       |  ← SECURITY-03
   |    - generic error 반환              |  ← SECURITY-09
   +--------------------------------------+
          |
          v
   [Supabase Auth] ← TLS 강제 (SECURITY-01)
```

---

## 파일 구조 추가 (NFR 관련)

```
baddie-eye/
├── lib/
│   ├── rate-limit.ts            # RateLimiter
│   └── validations/
│       └── auth.ts              # Zod 스키마
├── sentry.client.config.ts
├── sentry.server.config.ts
├── sentry.edge.config.ts
├── instrumentation.ts
├── next.config.ts               # 보안 헤더
└── app/
    ├── error.tsx
    ├── global-error.tsx
    └── (admin)/
        └── error.tsx
```

---

## Security Compliance (NFR Design 단계)

| 규칙 | 상태 | 구현 컴포넌트 |
|------|------|---------------|
| SECURITY-01 | 설계 완료 | Vercel/Supabase TLS (관리형) |
| SECURITY-03 | 설계 완료 | Sentry + beforeSend PII 마스킹 |
| SECURITY-04 | 설계 완료 | next.config.ts 헤더 |
| SECURITY-05 | 설계 완료 | lib/validations/auth.ts (Zod) |
| SECURITY-08 | 설계 완료 | middleware.ts Gateway |
| SECURITY-09 | 설계 완료 | Server Action generic error |
| SECURITY-11 | 설계 완료 | lib/rate-limit.ts |
| SECURITY-12 | 설계 완료 | 환경변수 분리 |
| SECURITY-15 | 설계 완료 | error.tsx / global-error.tsx |
| SECURITY-02, 06, 07, 10, 13, 14 | N/A 또는 Code Generation에서 검증 | — |
