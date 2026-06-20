# Business Rules — bolt-1-admin-auth

---

## 인증 규칙

| ID | 규칙 | 검증 위치 |
|----|------|-----------|
| BR-AUTH-01 | 이메일은 유효한 이메일 형식이어야 한다 | 클라이언트 + 서버 |
| BR-AUTH-02 | 비밀번호는 최소 8자 이상이어야 한다 | 클라이언트 + 서버 |
| BR-AUTH-03 | 로그인 실패 시 구체적 이유(이메일 없음/비밀번호 틀림)를 노출하지 않는다 | 서버 |
| BR-AUTH-04 | 이미 인증된 상태에서 `/admin/login` 접근 시 `/admin/dashboard`로 자동 리다이렉트 | 미들웨어 |
| BR-AUTH-05 | 세션은 1일 후 만료된다 | Supabase Auth 설정 |
| BR-AUTH-06 | 로그아웃 시 세션 토큰을 즉시 서버에서 무효화한다 | 서버 |
| BR-AUTH-07 | 모든 인증 검사는 서버사이드에서 수행한다 (클라이언트 우회 방지) | 미들웨어/서버 |

---

## 입력 유효성 검사 규칙

| ID | 필드 | 규칙 | 에러 메시지 |
|----|------|------|-------------|
| BR-VAL-01 | email | 필수, 이메일 형식 | "올바른 이메일 형식을 입력해주세요" |
| BR-VAL-02 | password | 필수, 최소 8자 | "비밀번호는 8자 이상이어야 합니다" |
| BR-VAL-03 | 전체 폼 | 서버사이드 재검증 (클라이언트 검증 외 이중 검증) | — |

---

## DB 스키마 규칙

| ID | 규칙 |
|----|------|
| BR-DB-01 | `membership_tier` 허용 값: `'regular'` \| `'loyal'` \| `'vip'`, 기본값 `'regular'` |
| BR-DB-02 | `appointments.status` 허용 값: `'pending'` \| `'completed'` \| `'cancelled'`, 기본값 `'pending'` |
| BR-DB-03 | 모든 테이블에 Row Level Security(RLS) 활성화 |
| BR-DB-04 | Admin(service_role 키 사용)은 모든 테이블 CRUD 가능 |
| BR-DB-05 | 일반 사용자(anon/authenticated)는 RLS 정책으로 데이터 접근 제한 |
| BR-DB-06 | `members.phone` 유니크 제약 — 동일 연락처 중복 등록 불가 |
| BR-DB-07 | `treatment_types.name` 유니크 제약 — 동일 시술명 중복 불가 |
| BR-DB-08 | `appointments.member_id` → `members.id` 외래키 (ON DELETE RESTRICT) |
| BR-DB-09 | `appointments.treatment_type_id` → `treatment_types.id` 외래키 (ON DELETE RESTRICT) |
| BR-DB-10 | `visit_history.member_id` → `members.id` 외래키 (ON DELETE RESTRICT) |

---

## 보안 규칙 [Security Extension]

| ID | 규칙 | 근거 |
|----|------|------|
| BR-SEC-01 | 하드코딩된 자격증명 금지 — 모든 키는 환경변수로 관리 | SECURITY-12 |
| BR-SEC-02 | `.env.local` 파일을 `.gitignore`에 포함 | SECURITY-12 |
| BR-SEC-03 | 프로덕션 응답에 스택 트레이스/내부 경로/프레임워크 버전 미노출 | SECURITY-09 |
| BR-SEC-04 | `pnpm-lock.yaml` 버전 관리에 포함 | SECURITY-10 |
| BR-SEC-05 | `next.config.ts`에 HTTP 보안 헤더 설정 (CSP, HSTS, X-Frame-Options 등) | SECURITY-04 |
