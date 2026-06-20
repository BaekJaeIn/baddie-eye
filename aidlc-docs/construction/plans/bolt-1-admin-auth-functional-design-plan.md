# Functional Design Plan — bolt-1-admin-auth

## 실행 체크리스트

- [x] 사용자 질문 수집
- [x] business-logic-model.md 생성
- [x] business-rules.md 생성
- [x] domain-entities.md 생성
- [x] frontend-components.md 생성

---

## 단위(Unit) 범위

**Unit**: bolt-1-admin-auth
**포함 기능**:

- Next.js + Supabase 프로젝트 초기 설정
- 전체 DB 스키마 초기 마이그레이션
- Admin 이메일/비밀번호 로그인
- `/admin/**` 라우트 보호 미들웨어
- Admin 대시보드 레이아웃 셸

---

## 사전 결정 사항 (질문 불필요)

| 항목               | 결정                                                             | 근거                               |
| ------------------ | ---------------------------------------------------------------- | ---------------------------------- |
| Admin 계정 저장소  | Supabase `auth.users` 활용 (별도 `admin_users` 테이블 불필요)    | 단일 계정, Supabase Auth로 충분    |
| 로그인 에러 메시지 | Generic 메시지 ("이메일 또는 비밀번호가 올바르지 않습니다")      | SECURITY-09: 계정 존재 여부 미노출 |
| 브루트포스 보호    | Supabase Auth 내장 보호 활용 + Next.js 미들웨어 레이트리밋       | SECURITY-12                        |
| Supabase RLS       | members, appointments 등 모든 테이블에 Row Level Security 활성화 | SECURITY-06                        |

---

## 설계 질문

아래 질문들은 DB 스키마와 화면 구성에 직접 영향을 미칩니다.
`[Answer]:` 뒤에 알파벳을 입력해주세요. 완료 후 "완료"라고 알려주세요.

---

### Question 1

Admin 세션은 얼마나 유지될까요?
(원장이 노트북을 닫았다가 다시 열어도 로그인 상태가 유지될 기간)

A) 1주일 (편의성 최우선, 매번 로그인 불편함 제거)

B) 1일 (하루 단위로 재로그인, 보안과 편의성 균형)

C) 브라우저 닫으면 만료 (가장 보안적, 매번 로그인)

D) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: B

---

### Question 2

DB 스키마의 `membership_tier` 값을 어떻게 정의할까요?

A) 한국어: `일반` / `단골` / `VIP`

B) 영어: `regular` / `loyal` / `vip`

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: B

---

### Question 3

DB 스키마의 `appointments.status` 값을 어떻게 정의할까요?

A) 한국어: `예약` / `완료` / `취소`

B) 영어: `pending` / `completed` / `cancelled`

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: B

---

### Question 4

Bolt 1에서 Admin 대시보드(`/admin/dashboard`)에 무엇을 표시할까요?
(Bolt 2~3에서 실제 회원/예약 기능이 추가될 예정)

A) 환영 메시지 + 빈 화면 (가장 단순, Bolt 2에서 채워짐)

B) 환영 메시지 + 빠른 링크 카드 (회원 관리, 예약 관리 — 현재는 비활성)

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: A
