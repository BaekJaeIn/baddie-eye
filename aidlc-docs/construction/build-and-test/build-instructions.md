# Build Instructions — 전체 프로젝트

## Prerequisites

- **Node.js**: 20.x LTS (검증: v20.11.1)
- **패키지 매니저**: pnpm 9.x
- **환경변수**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (빌드 필수)
  - 전체 변수는 [DEPLOYMENT.md](../../../DEPLOYMENT.md) 참조

## Build Steps

```bash
# 1. 의존성
pnpm install

# 2. 환경변수
cp .env.local.example .env.local   # 값 입력

# 3. 프로덕션 빌드
pnpm build

# 4. 개발 서버
pnpm dev
```

## 검증된 빌드 결과

```
✓ Compiled successfully
✓ Generating static pages (21/21)
Route (app): 27개 라우트 + Middleware
```

✅ TypeScript strict 통과, ESLint 통과.

## 주요 의존성

| 패키지 | 용도 |
|--------|------|
| next 14 | 프레임워크 |
| @supabase/ssr, supabase-js | DB/Auth/Storage |
| zod | 입력 검증 |
| recharts | 통계 차트 |
| web-push | 푸시 발송 |
| @sentry/nextjs | 에러 추적 |

## Troubleshooting

| 증상 | 해결 |
|------|------|
| `next.config.ts is not supported` | next.config.mjs 사용 (적용됨) |
| Supabase 쿠키 implicit any | CookieToSet 타입 명시 (적용됨) |
| Uint8Array → BufferSource 타입 에러 | as BufferSource 캐스팅 (적용됨) |
| EBUSY (Windows 설치) | pnpm install 재실행 |
| Sentry/OpenTelemetry 빌드 경고 | 무해 — 무시 가능 |
