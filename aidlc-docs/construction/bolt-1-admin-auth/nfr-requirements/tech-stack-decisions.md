# Tech Stack Decisions — bolt-1-admin-auth

---

## 확정 기술 스택

| 카테고리 | 선택 | 버전 | 결정 근거 |
|----------|------|------|-----------|
| **Runtime** | Node.js | 20.x LTS | 안정성, Next.js 14+ 지원 |
| **Framework** | Next.js (App Router) | 14.x+ | SPEC.md 결정, SSR + 라우팅 + API 통합 |
| **언어** | TypeScript | 5.x (strict) | 타입 안전성, 자동완성 |
| **스타일링** | Tailwind CSS | v3 | SPEC.md 결정, 빠른 UI 구성 |
| **패키지 매니저** | pnpm | 최신 | 사용자 선택, 빠른 설치 + 디스크 효율 |
| **DB/Auth/Storage** | Supabase | JS SDK v2 | SPEC.md 결정, Auth + DB + Storage 통합 |
| **Supabase SSR** | @supabase/ssr | 최신 | Next.js App Router 공식 지원 |
| **입력 검증** | Zod | v3 | TypeScript 추론 통합, Server Action 검증 |
| **에러 추적** | Sentry (@sentry/nextjs) | 최신 | 사용자 선택 (Q2=B), PII 필터링 설정 필요 |
| **단위 테스트** | Vitest + @testing-library/react | 최신 | Jest 대비 빠른 실행, ESM 네이티브 지원 |
| **E2E 테스트** | Playwright | 최신 | 사용자 선택 (Q3=B), 크로스 브라우저 지원 |
| **린터** | ESLint | Next.js 내장 설정 | 코드 품질 |
| **포매터** | Prettier | 최신 | 일관된 코드 스타일 |
| **배포 (프론트)** | Vercel | — | SPEC.md 결정, Next.js 최적 플랫폼 |
| **배포 (DB)** | Supabase Free → Pro | — | 개발: Free, 운영: Pro |

---

## 주요 패키지 목록 (`package.json`)

### dependencies
```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "@supabase/supabase-js": "^2.0.0",
  "@supabase/ssr": "^0.5.0",
  "zod": "^3.0.0",
  "@sentry/nextjs": "^8.0.0"
}
```

### devDependencies
```json
{
  "typescript": "^5.0.0",
  "@types/node": "^20.0.0",
  "@types/react": "^18.0.0",
  "@types/react-dom": "^18.0.0",
  "tailwindcss": "^3.0.0",
  "postcss": "^8.0.0",
  "autoprefixer": "^10.0.0",
  "eslint": "^8.0.0",
  "eslint-config-next": "^14.0.0",
  "prettier": "^3.0.0",
  "vitest": "^1.0.0",
  "@vitejs/plugin-react": "^4.0.0",
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.0.0",
  "@playwright/test": "^1.40.0"
}
```

---

## 결정 근거 상세

### Vitest vs Jest
- **선택**: Vitest
- **이유**: Next.js App Router의 ESM 환경과 호환성이 좋고, Jest 대비 3~10배 빠른 실행 속도. TypeScript 설정 불필요(내장).
- **주의**: Next.js 서버 컴포넌트 직접 테스트는 제한적 — 비즈니스 로직 단위 테스트 중심으로 작성.

### Zod 검증
- **선택**: Zod v3
- **이유**: TypeScript 타입 추론이 자동으로 되어 별도 타입 정의 불필요. Server Action에서 `FormData` 파싱 + 검증을 한번에 처리.

### Sentry 설정 주의사항 [SECURITY-03, SECURITY-09]
- `beforeSend` 훅으로 이메일/전화번호 등 PII 필드 마스킹 필수
- `environment: 'development'`에서는 Sentry 전송 비활성화 권장
- 소스맵은 Vercel 배포 시 자동 업로드 설정

---

## 환경변수 목록 (`.env.local.example`)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]

# Sentry
NEXT_PUBLIC_SENTRY_DSN=[sentry-dsn]
SENTRY_AUTH_TOKEN=[sentry-auth-token]  # 소스맵 업로드용 (CI/CD에서 사용)
SENTRY_ORG=[org-slug]
SENTRY_PROJECT=[project-slug]
```

> ⚠️ `SENTRY_AUTH_TOKEN`은 절대 클라이언트 번들에 포함되면 안 됨. CI/CD 환경변수로만 관리.
