# Functional Design Plan — bolt-2-member-management

## 실행 체크리스트

- [x] 사용자 질문 수집
- [x] business-logic-model.md 생성
- [x] business-rules.md 생성
- [x] frontend-components.md 생성

---

## 단위(Unit) 범위 — SPEC.md FR-01

**Unit**: bolt-2-member-management
**포함 기능**:

- 회원 목록 조회 (검색/필터)
- 회원 상세 조회
- 회원 등록 (Create)
- 회원 수정 (Update)
- 회원 삭제 (Delete)

**전제**: `members` 테이블은 Bolt 1에서 이미 생성됨. Admin 인증/레이아웃 셸 재사용.

---

## 사전 결정 사항 (질문 불필요)

| 항목            | 결정                                                                                 | 근거                    |
| --------------- | ------------------------------------------------------------------------------------ | ----------------------- |
| 데이터 접근     | Server Component에서 직접 Supabase 조회 + Server Action으로 mutation                 | Bolt 1 패턴 일관성      |
| 입력 검증       | Zod 스키마 (`lib/validations/member.ts`)                                             | SECURITY-05             |
| 사이드바 메뉴   | "회원 관리" 항목 추가 (`/admin/members`)                                             | Bolt 1 점진적 메뉴 전략 |
| 폼 필드         | SPEC.md members 스키마 따름 (이름, 연락처, 생일, 첫방문일, 알러지메모, 등급, 포인트) | 데이터 모델 확정됨      |
| 전화번호 유니크 | 중복 등록 시 에러 (BR-DB-06)                                                         | Bolt 1 스키마 제약      |

---

## 설계 질문

회원 관리 화면 구성과 동작에 관한 결정입니다.
`[Answer]:` 뒤에 알파벳을 입력해주세요. 완료 후 "완료"라고 알려주세요.

---

### Question 1

회원 목록을 어떻게 표시할까요?

A) 테이블 형태 (이름·연락처·등급·마지막방문 컬럼, 데스크탑에서 정보 밀도 높음)

B) 카드 형태 (회원별 카드, 시각적이지만 한 화면에 적게 표시)

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: B

---

### Question 2

회원 검색/필터 기준을 어떻게 할까요? (복수 선택 가능, 예: "A, C")

A) 이름 검색

B) 연락처(전화번호) 검색

C) 멤버십 등급 필터 (일반/단골/VIP)

D) 검색 없이 전체 목록만 (회원 수가 적을 때)

X) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: A, B, C

---

### Question 3

회원 삭제 방식을 어떻게 할까요?
(주의: 회원에게 예약/시술 내역이 있으면 Bolt 1 스키마 제약(ON DELETE RESTRICT)으로 물리 삭제가 막힙니다)

A) 물리 삭제 (DB에서 완전 삭제, 예약/시술 내역 있으면 삭제 불가 에러 표시)

B) 소프트 삭제 (`is_active` 플래그로 숨김 처리, 데이터 보존 — 스키마에 컬럼 추가 필요)

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: B

---

### Question 4

회원 등록/수정 화면 형태를 어떻게 할까요?

A) 별도 페이지 (`/admin/members/new`, `/admin/members/[id]/edit`)

B) 모달(팝업) 폼 (목록 화면 위에 오버레이)

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: A

---

### Question 5

회원 목록 페이지네이션이 필요할까요?

A) 페이지네이션 추가 (회원 수가 많아질 것을 대비, 페이지당 20명)

B) 불필요 (1인 샵 규모상 전체 표시로 충분, 나중에 필요시 추가)

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: A
