# 요구사항 문서 — 속눈썹연장샵 회원관리 시스템

## Intent Analysis

| 항목 | 내용 |
|------|------|
| **사용자 요청** | SPEC.md 기반 Bolt 1부터 단계적 구현 시작 |
| **요청 유형** | New Project (Greenfield) |
| **범위** | System-wide — Admin 웹 + Member PWA 전체 플랫폼 |
| **복잡도** | Moderate (멀티 역할, 예약/시술/멤버십 도메인, PWA, Kakao OAuth) |
| **명확도** | Clear (SPEC.md에 기술 스택·도메인·로드맵 모두 정의됨) |

---

## 전체 시스템 기능 요구사항

### Admin (관리자 웹, 데스크탑 우선)

| ID | 요구사항 | Bolt |
|----|----------|------|
| FR-01 | 회원 CRUD: 이름, 연락처, 생일, 첫방문일, 알러지/주의사항 | 2 |
| FR-02 | 예약 캘린더 뷰, 예약 등록/변경/취소 | 3 |
| FR-03 | 시술 종류 관리 (소요시간, 기본가격), 시술 내역 기록 | 3 |
| FR-04 | 재방문 권장 시점 표시 (마지막 시술 기준) | 3 |
| FR-05 | 멤버십 등급(일반/단골/VIP), 포인트 적립/차감 | (보류) |
| FR-06 | 매출 통계: 기간별/시술별, 재방문율, 신규 vs 재방문 | 7 |
| FR-07 | 알림 발송: 예약 리마인더, 재방문 권유 (1차 수동) | 6 |

### Member (고객용 PWA, 모바일 우선)

| ID | 요구사항 | Bolt |
|----|----------|------|
| FR-08 | 카카오 소셜 로그인 | 4 |
| FR-09 | 마이페이지: 시술 히스토리, 포인트/등급 확인 | 4 |
| FR-10 | 예약 가능 시간 확인 후 예약 신청/변경/취소 | 5 |
| FR-11 | 웹푸시 알림 수신 (예약 리마인더) | 6 |
| FR-12 | PWA 홈화면 추가(Add to Home Screen) | 7 |

---

## Bolt 1 기능 요구사항

| ID | 요구사항 | 비고 |
|----|----------|------|
| FR-B1-01 | Next.js 14+ App Router 프로젝트 초기화 (TypeScript strict, Tailwind CSS) | — |
| FR-B1-02 | Supabase 클라이언트 설정 (환경변수 기반, 서버/클라이언트 분리) | — |
| FR-B1-03 | 초기 DB 스키마 마이그레이션 (전체 테이블 정의) | SQL 마이그레이션 파일 |
| FR-B1-04 | Admin 이메일/비밀번호 로그인 (Supabase Auth) | 단일 계정, 대시보드에서 수동 생성 |
| FR-B1-05 | `/admin/*` 라우트 인증 미들웨어 (unauthenticated → /admin/login 리다이렉트) | deny-by-default |
| FR-B1-06 | Admin 로그인 폼 UI (`/admin/login`) | 이메일, 비밀번호 |
| FR-B1-07 | 로그인 성공 후 Admin 대시보드 레이아웃 셸 (`/admin/dashboard`) | — |
| FR-B1-08 | 로그아웃 기능 (세션 무효화) | — |

---

## 비기능 요구사항 (NFR)

### 기술 스택 (확정)

| 항목 | 선택 | 결정 근거 |
|------|------|-----------|
| Framework | Next.js 14+ (App Router) | SPEC.md 결정 |
| Language | TypeScript (strict mode) | 타입 안전성 |
| Styling | Tailwind CSS | SPEC.md 결정 |
| Backend/DB | Supabase (Postgres + Auth + Storage) | SPEC.md 결정 |
| Customer Auth | Kakao OAuth (Bolt 4에서 구현) | SPEC.md 결정 |
| Package Manager | pnpm | 사용자 선택 (Q3) |
| PWA | next-pwa 또는 수동 manifest.json + SW | SPEC.md 결정 |
| Alerts | Web Push API 1차, 카카오 알림톡 추후 | SPEC.md 결정 |
| Deployment | Vercel + Supabase | SPEC.md 결정 |

### 결제/알림/슬롯 결정 사항 (확정)

| 항목 | 결정 |
|------|------|
| 결제 | 수동 입력, PG 연동 나중에 검토 |
| 알림 | 웹푸시/수동, 카카오 알림톡 나중에 검토 |
| 예약 슬롯 | 원장 1인 단일 슬롯 (동시 예약 1개) |

### Security NFR [Security Baseline 활성화]

| ID | 요구사항 | 근거 규칙 |
|----|----------|-----------|
| NFR-SEC-01 | 로그인 엔드포인트 브루트포스 보호 (레이트리밋 또는 딜레이) | SECURITY-12 |
| NFR-SEC-02 | 세션 쿠키: Secure + HttpOnly + SameSite=Lax | SECURITY-12 |
| NFR-SEC-03 | 모든 `/admin/*` 라우트 미들웨어 인증 강제 (deny-by-default) | SECURITY-08 |
| NFR-SEC-04 | JWT/세션 토큰 서버사이드 검증 (모든 요청) | SECURITY-08 |
| NFR-SEC-05 | HTTP 보안 헤더: CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy | SECURITY-04 |
| NFR-SEC-06 | 로그인 입력 검증: 이메일 형식, 비밀번호 최소 길이 | SECURITY-05 |
| NFR-SEC-07 | 프로덕션 에러 응답 — 스택 트레이스/내부 경로 미노출 | SECURITY-09 |
| NFR-SEC-08 | 구조화 로깅, 민감 정보(비밀번호/토큰/PII) 로그 제외 | SECURITY-03 |
| NFR-SEC-09 | pnpm lock 파일 커밋, 의존성 취약점 스캔 설정 | SECURITY-10 |
| NFR-SEC-10 | 하드코딩 자격증명 금지, .env.local 사용 | SECURITY-12 |
| NFR-SEC-11 | 전역 에러 핸들러 (미처리 예외 캐치 → 안전한 응답 반환) | SECURITY-15 |

### 비활성화 Extension

| Extension | 상태 | 이유 |
|-----------|------|------|
| Resiliency Baseline | 비활성화 | 소규모 1인 샵 앱, Vercel/Supabase가 기본 가용성 처리 |
| Property-Based Testing | 비활성화 | Bolt 1은 CRUD 범위, 복잡한 비즈니스 로직 없음 |

---

## 데이터 모델 (전체, SPEC.md 기반)

```sql
-- members: 회원 정보
members (id, name, phone, birthday, first_visit_at, allergy_note, membership_tier, points, created_at)

-- treatment_types: 시술 종류
treatment_types (id, name, duration_min, base_price)

-- appointments: 예약
appointments (id, member_id, treatment_type_id, scheduled_at, status, memo)

-- visit_history: 시술 내역
visit_history (id, member_id, appointment_id, treatment_type_id, visited_at, price_paid, before_after_photo_url)

-- admin_users: Supabase Auth 사용 시 별도 테이블 불필요 (auth.users 활용)
```

---

## 개발 로드맵 (SPEC.md Bolt 계획)

| Bolt | 내용 |
|------|------|
| **Bolt 1** (현재) | 프로젝트 셋업, Supabase 연결, Admin 로그인 |
| Bolt 2 | Admin 회원 CRUD |
| Bolt 3 | Admin 예약/시술 관리 |
| Bolt 4 | Member PWA (카카오 로그인, 마이페이지) |
| Bolt 5 | Member 예약 기능 |
| Bolt 6 | 웹푸시 알림 |
| Bolt 7 | 매출 통계, Vercel 배포, 도메인, PWA 최종 |
