# Functional Design Plan — bolt-3-booking-treatment

## 실행 체크리스트

- [x] 사용자 질문 수집
- [x] business-logic-model.md 생성
- [x] business-rules.md 생성
- [x] frontend-components.md 생성

---

## 단위(Unit) 범위 — SPEC.md FR-02, FR-03, FR-04

**Unit**: bolt-3-booking-treatment
**포함 기능**:

- **시술 종류 관리**: treatment_types CRUD (이름, 소요시간, 기본가격)
- **예약 관리**: 캘린더 뷰, 예약 등록/변경/취소
- **시술 내역**: 시술 완료 기록, 회원별 히스토리, 재방문 권장 시점

**전제**: `treatment_types`, `appointments`, `visit_history` 테이블은 Bolt 1에서 생성됨.
Admin 인증/레이아웃 셸, 회원 데이터(Bolt 2) 재사용.

---

## 사전 결정 사항 (질문 불필요)

| 항목        | 결정                                                                 | 근거                             |
| ----------- | -------------------------------------------------------------------- | -------------------------------- |
| 예약 슬롯   | 원장 1인 단일 슬롯 (동시 예약 1개)                                   | SPEC.md Open Questions 확정      |
| 데이터 접근 | Server Component 조회 + Server Action mutation                       | Bolt 1/2 패턴                    |
| 입력 검증   | Zod 스키마                                                           | SECURITY-05                      |
| 사이드바    | "예약 관리", "시술 종류" 메뉴 추가                                   | 점진적 메뉴 전략                 |
| RLS         | appointments/visit_history/treatment_types에 authenticated 정책 추가 | SECURITY-06 (Bolt 2와 동일 패턴) |

---

## 설계 질문

예약/시술 관리는 화면과 로직이 복잡하므로 결정사항이 많습니다.
`[Answer]:` 뒤에 알파벳을 입력해주세요. 완료 후 "완료"라고 알려주세요.

---

### Question 1

예약 캘린더 뷰를 어떻게 구현할까요?
(지금까지 Tailwind만 썼지만, 캘린더는 직접 구현이 복잡합니다)

A) 주간 뷰 중심으로 직접 구현 (외부 라이브러리 없음, Tailwind 그리드로 시간대 표시 — 1인샵 단일슬롯에 적합)

B) 라이브러리 사용 (예: react-big-calendar 또는 FullCalendar — 월/주/일 뷰 풍부하지만 의존성 추가)

C) 목록 기반 (캘린더 대신 날짜별 예약 리스트 — 가장 단순, 캘린더 시각화 없음)

D) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: A

---

### Question 2

예약 등록 시 시간 입력을 어떻게 할까요?

A) 날짜 + 시간 직접 입력 (datetime, 자유롭게 — 1인샵이라 유연)

B) 영업시간 내 30분 단위 슬롯 선택 (예: 10:00, 10:30... 정해진 시간대만)

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: B

---

### Question 3

예약과 시술 내역(visit_history)의 관계를 어떻게 처리할까요?

A) 예약 상태를 '완료'로 변경하면 시술 내역 자동 생성 (실제 결제금액·사진은 나중에 보완)

B) 예약 완료 처리 시 시술 내역 입력 폼 표시 (결제금액 입력 후 시술 내역 생성)

C) 예약과 시술 내역을 완전히 분리 (시술 내역을 별도로 수동 기록)

D) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: A

---

### Question 4

재방문 권장 시점(FR-04)을 어떻게 계산할까요?
(속눈썹 연장은 보통 3~4주 후 리터치 권장)

A) 마지막 시술일 + 고정 기간(예: 3주) — 단순

B) 시술 종류별로 권장 주기 설정 (treatment_types에 권장주기 컬럼 추가)

C) 이번 Bolt에서는 보류 (나중에 추가)

D) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: B

---

### Question 5

이번 Bolt 3의 범위를 어떻게 할까요?
(범위가 크므로 한 번에 다 할지, 나눠서 할지 결정)

A) 전체 한 번에 (시술 종류 + 예약 + 시술 내역 모두)

B) 시술 종류 관리 + 예약 관리까지만 (시술 내역은 Bolt 3.5로 분리)

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: B
