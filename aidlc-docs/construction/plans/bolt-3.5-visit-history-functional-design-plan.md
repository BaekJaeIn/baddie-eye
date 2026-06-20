# Functional Design Plan — bolt-3.5-visit-history

## 실행 체크리스트

- [x] 사용자 질문 수집
- [x] business-logic-model.md 생성
- [x] business-rules.md 생성
- [x] frontend-components.md 생성

---

## 단위(Unit) 범위 — SPEC.md FR-04

**Unit**: bolt-3.5-visit-history
**포함 기능**:

- 예약 완료 처리 시 시술 내역(visit_history) 자동 생성 (Bolt 3 Q3=A)
- 회원별 시술 히스토리 조회 (회원 상세에 표시)
- 재방문 권장 시점 표시 (마지막 시술일 + 시술별 권장주기 Q4=B)
- 시술 내역 결제금액/사진 보완 (Q3 "나중에 보완")

**전제**: `visit_history` 테이블(Bolt 1), `recommended_interval_days`(Bolt 3) 존재.
예약 완료 액션(Bolt 3 updateAppointmentStatusAction) 수정.

---

## 사전 결정 사항 (Bolt 3 답변 기반, 질문 불필요)

| 항목           | 결정                                                    | 근거                    |
| -------------- | ------------------------------------------------------- | ----------------------- |
| 자동 생성 시점 | 예약 status='completed' 전환 시                         | Q3=A                    |
| 자동 생성 값   | price_paid = 시술 base_price, photo_url = null          | Q3 "결제금액 나중 보완" |
| 재방문 계산    | 마지막 visited_at + treatment.recommended_interval_days | Q4=B                    |
| RLS            | visit_history에 authenticated 정책 추가                 | Bolt 2/3 패턴           |

---

## 설계 질문

`[Answer]:` 뒤에 알파벳을 입력해주세요. 완료 후 "완료"라고 알려주세요.

---

### Question 1

시술 내역 결제금액·사진을 어떻게 보완(수정)할까요?
(자동 생성된 시술 내역은 결제금액=기본가격, 사진=없음으로 시작)

A) 회원 상세의 시술 내역 항목에서 인라인 편집 (결제금액 수정, 사진 URL 입력)

B) 시술 내역 전용 편집 페이지 (`/admin/visits/[id]/edit`)

C) 이번엔 자동 생성까지만, 보완 기능은 나중에 (결제금액=기본가격 고정)

D) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: B

---

### Question 2

재방문 권장을 어디에 표시할까요? (복수 선택 가능)

A) 회원 상세 페이지 (마지막 시술 + 권장일 + "재방문 권장일 D-day")

B) 회원 목록 카드 (재방문 시기 임박/경과 회원 배지)

C) 대시보드 (이번 주 재방문 권장 회원 목록)

X) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: A,B,C

---

### Question 3

사진 업로드는 어떻게 할까요?
(before/after 사진 — Supabase Storage 사용 가능하지만 설정 필요)

A) URL 직접 입력만 (Storage 미사용, 외부 이미지 링크 붙여넣기 — 가장 단순)

B) Supabase Storage 업로드 (파일 선택 → 업로드, 설정 필요)

C) 이번엔 사진 보류 (결제금액만 다룸)

D) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: B

---

### Question 4

별도의 전체 시술 내역 화면이 필요할까요?

A) 회원별 히스토리만 (회원 상세에 표시, 별도 전체 목록 없음 — 단순)

B) 전체 시술 내역 목록 화면도 추가 (`/admin/visits`, 날짜별 전체 — 매출 통계 Bolt 7 준비)

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: B
