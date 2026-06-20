# NFR Requirements Plan — bolt-1-admin-auth

## 실행 체크리스트

- [x] 사용자 질문 수집
- [x] nfr-requirements.md 생성
- [x] tech-stack-decisions.md 생성

---

## 사전 결정 사항 (질문 불필요)

Security Extension에서 이미 정의된 NFR과 관리형 서비스(Vercel/Supabase)로 자동 충족되는 항목은 질문 생략합니다.

| NFR 항목         | 결정                          | 근거                                       |
| ---------------- | ----------------------------- | ------------------------------------------ |
| HTTP 보안 헤더   | next.config.ts에서 설정       | SECURITY-04, 이미 Functional Design에 반영 |
| 입력 유효성 검사 | Zod 스키마 검증               | SECURITY-05, 타입 안전성                   |
| 세션 보안        | Supabase SSR 자동 처리        | SECURITY-12                                |
| CDN              | Vercel Edge Network 자동 적용 | 관리형 서비스                              |
| SSL/TLS          | Vercel 자동 처리              | SECURITY-01                                |
| DB 가용성        | Supabase 관리형 Postgres      | 별도 설정 불필요                           |

---

## 설계 질문

아래는 코드 생성 범위와 운영 환경에 직접 영향을 미치는 결정들입니다.

---

### Question 1

Supabase 플랜을 어떻게 할까요?
Free 플랜은 7일 이상 비활성 시 DB가 일시 정지되므로 실제 운영에는 주의가 필요합니다.

A) Free 플랜으로 시작 (월 $0, 개발/테스트용, 운영 전 Pro 전환 예정)

B) Pro 플랜 사용 (월 $25, 일시 정지 없음, 실제 고객 데이터 보관 시 권장)

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: A

---

### Question 2

에러 추적/모니터링을 어떻게 할까요?

A) Vercel 내장 로그 + Supabase 대시보드로 충분 (추가 도구 없음, 단순함 유지)

B) Sentry 추가 (에러 자동 알림, 스택 트레이스 추적, 무료 플랜 있음)

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: B

---

### Question 3

테스트 수준을 어떻게 할까요?

A) 단위 테스트만 (핵심 비즈니스 로직, 유틸 함수 대상, 빠르게 시작)

B) 단위 테스트 + E2E 테스트 (Playwright로 로그인 플로우 등 주요 경로 검증)

C) 테스트 코드 없이 진행 (빠른 MVP 우선, 나중에 추가)

D) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: B
