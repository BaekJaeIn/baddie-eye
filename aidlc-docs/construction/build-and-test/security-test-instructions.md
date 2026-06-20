# Security Test Instructions — Bolt 1

> Security Extension 활성화 프로젝트. 보안 검증 절차.

## 1. 의존성 취약점 스캔 [SECURITY-10]

```bash
pnpm audit
```

- CI 파이프라인에 포함 권장
- High/Critical 취약점 발견 시 `pnpm update` 또는 대체 패키지 검토

## 2. 보안 헤더 검증 [SECURITY-04]

개발 서버 기동 후:
```bash
curl -I http://localhost:3000/admin/login
```

확인 항목:
- [ ] `Content-Security-Policy` 존재
- [ ] `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`

## 3. 인증/인가 테스트 [SECURITY-08]

E2E 시나리오 2로 자동 검증 (미인증 → 리다이렉트).
수동 확인:
- [ ] 미인증 상태 `/admin/dashboard` 직접 접근 → `/admin/login` 리다이렉트
- [ ] 로그아웃 후 뒤로가기 → 보호 페이지 접근 불가

## 4. 입력 검증 테스트 [SECURITY-05]

단위 테스트(`auth.validation.test.ts`)로 자동 검증.
- [ ] 잘못된 이메일/짧은 비밀번호 거부 확인

## 5. 계정 열거 방지 [SECURITY-09]

E2E 시나리오 3으로 자동 검증.
- [ ] 존재하지 않는 이메일 vs 틀린 비밀번호 → 동일한 generic 메시지

## 6. 시크릿 관리 검증 [SECURITY-12]

- [ ] `.env.local`이 `.gitignore`에 포함되어 git에 커밋되지 않음
- [ ] `SENTRY_AUTH_TOKEN`이 클라이언트 번들에 없음 (NEXT_PUBLIC_ 접두사 없음)
- [ ] 소스코드 내 하드코딩된 키 없음

## 7. RLS 검증 [SECURITY-06]

Supabase SQL Editor:
```sql
-- RLS 활성화 확인
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public';
-- 모든 테이블 rowsecurity = true 확인
```

## Security Compliance 요약

| 규칙 | 검증 방법 | 상태 |
|------|-----------|------|
| SECURITY-03 | Sentry PII 마스킹 (코드 리뷰) | 구현됨 |
| SECURITY-04 | curl 헤더 확인 | 빌드 확인됨 |
| SECURITY-05 | 단위 테스트 | ✅ 통과 |
| SECURITY-06 | RLS SQL 확인 | 마이그레이션 포함 |
| SECURITY-08 | E2E 시나리오 2 | 코드 구현됨 |
| SECURITY-09 | E2E 시나리오 3 | 코드 구현됨 |
| SECURITY-10 | pnpm audit | 실행 필요 |
| SECURITY-11 | 레이트리밋 단위 테스트 | ✅ 통과 |
| SECURITY-12 | .gitignore + 환경변수 | 구현됨 |
| SECURITY-15 | 에러 바운더리 (코드 리뷰) | 구현됨 |
