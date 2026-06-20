# Functional Design Plan — bolt-4-member-pwa

## 실행 체크리스트

- [x] 사용자 질문 수집
- [x] business-logic-model.md 생성
- [x] business-rules.md 생성
- [x] frontend-components.md 생성

---

## 단위(Unit) 범위 — SPEC.md FR-08, FR-09, FR-12

**Unit**: bolt-4-member-pwa
**포함 기능**:

- 카카오 소셜 로그인 (고객용)
- 마이페이지: 내 시술 히스토리, 포인트/등급 확인
- PWA 기본 (manifest, 홈화면 추가)

**제외 (Bolt 5+)**: 예약 신청(Bolt 5), 웹푸시 알림(Bolt 6)

**전제**: Admin 영역(Bolt 1~3.5) 완성. members/visit_history 데이터 존재.

---

## 핵심 난제: 카카오 사용자 ↔ 회원(members) 연결

- Admin이 등록한 `members` 레코드는 이름/전화번호 기반.
- 카카오 로그인 사용자는 `auth.users`에 별도 생성됨.
- **연결 필요**: 카카오로 로그인한 고객을 올바른 members 레코드와 매핑.
- 카카오 OAuth는 기본적으로 전화번호를 안 줌(비즈앱 검수 필요) → 고객이 직접 입력하는 방식이 현실적.

---

## 사전 결정 사항 (질문 불필요)

| 항목              | 결정                                      | 근거      |
| ----------------- | ----------------------------------------- | --------- |
| 고객 인증         | Supabase Auth + Kakao OAuth provider      | SPEC.md   |
| 라우트            | `(member)` route group, 모바일 우선       | SPEC.md   |
| Admin과 분리      | `/admin/*`(이메일) vs 고객 라우트(카카오) | 역할 분리 |
| 마이페이지 데이터 | 연결된 members + visit_history(읽기 전용) | FR-09     |

---

## 설계 질문

카카오 연동과 PWA는 외부 설정이 얽혀 결정이 중요합니다.
`[Answer]:` 뒤에 알파벳을 입력해주세요. 완료 후 "완료"라고 알려주세요.

---

### Question 1

카카오 로그인 고객을 회원(members) 레코드와 어떻게 연결할까요?

A) 첫 로그인 시 전화번호 입력 → members.phone과 매칭 → 연결(members에 user_id 저장)
(Admin이 미리 등록한 회원만 매칭됨, 가장 현실적)

B) 카카오에서 전화번호 자동 수신 → 자동 매칭 (카카오 비즈앱 인증·검수 필요, 설정 복잡)

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: A

---

### Question 2

전화번호 매칭에 실패한 고객(아직 Admin이 등록 안 함, 또는 번호 불일치)은 어떻게 처리할까요?

A) "등록된 회원 정보가 없습니다. 샵에 문의해주세요" 안내 (Admin이 등록해야 연결)

B) 카카오 정보로 신규 회원 자동 생성 (고객이 직접 가입, Admin 등록 불필요)

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: B

---

### Question 3

PWA 범위를 어떻게 할까요?

A) manifest.json + 아이콘 + 기본 service worker (홈화면 추가 + 설치 가능, 오프라인은 최소)

B) manifest만 (홈화면 추가 메타데이터만, service worker 없음 — 가장 단순)

C) 풀 PWA (오프라인 캐싱, 백그라운드 — Bolt 6 웹푸시와 함께 확장)

D) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: A

---

### Question 4

전화번호 매칭 시 본인 확인을 어떻게 할까요?
(전화번호만 입력하면 남의 번호로 타인 정보 조회 위험 — 보안)

A) 전화번호 입력만으로 연결 (간편하지만, 번호 아는 사람이 조회 가능 — 소규모 신뢰 기반)

B) 전화번호 + 이름 둘 다 일치해야 연결 (간단한 이중 확인)

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: A

---

### Question 5

이번 Bolt 4 범위를 어떻게 할까요?
(카카오 OAuth는 사용자가 카카오 개발자 콘솔 + Supabase 설정을 해야 실제 동작)

A) 전체 구현 (카카오 로그인 + 회원 연결 + 마이페이지 + PWA) — 코드 완성, 설정은 가이드 제공

B) 마이페이지 + PWA 먼저, 카카오는 이메일 로그인으로 임시 대체 후 나중에 카카오 연결
(외부 설정 없이 먼저 고객 화면 확인 가능)

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: A
