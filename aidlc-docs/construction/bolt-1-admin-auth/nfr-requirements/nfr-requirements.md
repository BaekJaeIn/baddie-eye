# NFR Requirements — bolt-1-admin-auth

---

## 성능 (Performance)

| NFR | 목표 | 비고 |
|-----|------|------|
| 페이지 로드 | Core Web Vitals 통과 (LCP < 2.5s) | Vercel Edge Network + Next.js 자동 최적화 |
| 로그인 응답 | < 2초 (Supabase Auth API 응답 포함) | 느린 네트워크 고려 |
| DB 쿼리 | 인덱스 필수 컬럼에 인덱스 설정 | `members.phone`, `appointments.scheduled_at`, `appointments.member_id` |

---

## 가용성 (Availability)

| NFR | 목표 | 비고 |
|-----|------|------|
| Vercel 프론트엔드 | 99.99% SLA | 관리형 서비스 자동 보장 |
| Supabase DB | Free 플랜 사용 중 (개발/테스트) | **주의**: 비활성 7일 후 프로젝트 일시 정지. 실제 고객 운영 전 Pro 전환 필요 |
| 배포 전략 | Vercel 자동 롤백 지원 | 배포 실패 시 이전 버전으로 자동 복구 |

> **⚠️ 운영 전 체크리스트**: Supabase Free → Pro 업그레이드 후 고객 데이터 수집 시작

---

## 보안 (Security) — Security Extension 전체 적용

| 규칙 ID | 요구사항 | 구현 방법 |
|---------|----------|-----------|
| SECURITY-01 | 전송 중 암호화 | Vercel HTTPS 자동, Supabase TLS 강제 |
| SECURITY-03 | 구조화 로깅 (PII 미포함) | Sentry (SECURITY-03 준수 설정) |
| SECURITY-04 | HTTP 보안 헤더 | `next.config.ts` headers() 설정 |
| SECURITY-05 | 입력 유효성 검사 | Zod 스키마 (클라이언트 + 서버) |
| SECURITY-08 | 접근 제어 (deny-by-default) | `middleware.ts` |
| SECURITY-09 | 에러 응답 경화 | Generic 메시지, Sentry에만 상세 로그 |
| SECURITY-10 | 공급망 보안 | `pnpm-lock.yaml` 커밋, `pnpm audit` CI 포함 |
| SECURITY-11 | 보안 설계 원칙 | AuthService 집중, 레이트리밋 미들웨어 |
| SECURITY-12 | 인증/자격증명 관리 | Supabase Auth, 환경변수, 세션 1일 |
| SECURITY-15 | 예외 처리 | try/catch 전수, Sentry 전역 핸들러 |

---

## 에러 추적 (Observability)

| 도구 | 용도 | 플랜 |
|------|------|------|
| **Sentry** (`@sentry/nextjs`) | 클라이언트/서버 에러 자동 캡처, 스택 트레이스, 알림 | Free (5k 에러/월) |
| Vercel 로그 | 배포 로그, Edge Function 로그 | Vercel 내장 |
| Supabase 대시보드 | DB 쿼리 로그, Auth 로그 | Supabase 내장 |

**Sentry 설정 요구사항 [SECURITY-03, SECURITY-09]:**
- PII 필터링: 이메일/전화번호 마스킹
- 프로덕션 에러만 Sentry로 전송 (개발환경 제외)
- 소스맵 업로드로 난독화 스택 트레이스 해독

---

## 테스트 (Testing)

| 레벨 | 도구 | 대상 |
|------|------|------|
| 단위 테스트 | **Vitest** + @testing-library/react | `AuthService`, Zod 스키마, 유틸 함수 |
| E2E 테스트 | **Playwright** | 로그인 플로우, 미들웨어 보호, 로그아웃 |

**단위 테스트 커버리지 목표:**
- `AuthService.signIn()`: 성공/실패 케이스
- Zod 검증 스키마: 유효/무효 입력
- 미들웨어 리다이렉트 로직

**E2E 테스트 시나리오:**
1. 올바른 자격증명으로 로그인 → 대시보드 이동 확인
2. 잘못된 자격증명 → 에러 메시지 표시 확인
3. 미인증 상태로 `/admin/dashboard` 직접 접근 → 로그인 페이지 리다이렉트 확인
4. 로그아웃 → 로그인 페이지 이동 + 보호 페이지 접근 차단 확인

---

## 유지보수성 (Maintainability)

| NFR | 목표 |
|-----|------|
| TypeScript | strict mode, `noImplicitAny: true` |
| 린팅 | ESLint (Next.js 권장 설정) |
| 포매팅 | Prettier |
| 의존성 관리 | `pnpm audit` CI에서 실행 [SECURITY-10] |
