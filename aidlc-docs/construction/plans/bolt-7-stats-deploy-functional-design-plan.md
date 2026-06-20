# Functional Design Plan — bolt-7-stats-deploy

## 실행 체크리스트

- [x] 사용자 질문 수집
- [x] business-logic-model.md 생성
- [x] business-rules.md 생성
- [x] frontend-components.md 생성

---

## 단위(Unit) 범위 — SPEC.md FR-06 + 배포 마무리

**Unit**: bolt-7-stats-deploy
**포함 기능**:

- 매출 통계 (기간별/시술별 매출, 재방문율, 신규 vs 재방문)
- 배포 마무리 (PWA 최종 점검, 배포 가이드, README 갱신)

**전제**: visit_history(Bolt 3.5) 데이터 기반. Admin 영역.

---

## 데이터 소스

```
visit_history (price_paid, visited_at, member_id, treatment_type_id)
  + treatment_types (name) — 시술별 매출
  + members — 신규/재방문 판별

매출 = SUM(price_paid)
재방문율 = (2회 이상 방문 회원 수) / (전체 방문 회원 수)
신규 vs 재방문 = 기간 내 첫 방문 회원 vs 기존 회원
```

---

## 사전 결정 사항 (질문 불필요)

| 항목     | 결정                                  | 근거        |
| -------- | ------------------------------------- | ----------- |
| 위치     | Admin 대시보드 또는 /admin/stats      | 기존 셸     |
| 데이터   | visit_history 집계 (Postgres 뷰/쿼리) | 기존 스키마 |
| 사이드바 | "통계" 메뉴 추가                      | 점진적 메뉴 |

---

## 설계 질문

`[Answer]:` 뒤에 알파벳을 입력해주세요. 완료 후 "완료"라고 알려주세요.

---

### Question 1

통계 화면을 어디에 둘까요?

A) 별도 페이지 `/admin/stats` (사이드바 "통계" 메뉴)

B) 대시보드(`/admin/dashboard`)에 통합 (한 화면에 요약)

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: A

---

### Question 2

통계 기간을 어떻게 선택할까요?

A) 월 선택 (예: 2026-06, 드롭다운/이전·다음 달)

B) 기간 직접 지정 (시작일~종료일)

C) 고정 뷰 (이번 달 / 최근 3개월 등 프리셋)

D) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: A

---

### Question 3

포함할 지표를 선택해주세요. (복수 선택 가능, 예: "A, B, C")

A) 기간 총매출 + 방문 건수

B) 시술별 매출 (시술 종류별 합계)

C) 재방문율 (재방문 회원 비율)

D) 신규 vs 재방문 비율

X) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: A,B,C,D

---

### Question 4

차트 시각화를 어떻게 할까요?
(지금까지 Tailwind만 사용)

A) 숫자 카드 + 간단한 CSS 막대 그래프 (라이브러리 없음, 가벼움)

B) 차트 라이브러리 추가 (recharts 등 — 풍부한 시각화, 의존성 추가)

C) 숫자 카드만 (그래프 없이 핵심 수치만)

D) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: B

---

### Question 5

배포 마무리를 어디까지 도울까요?

A) 배포 가이드 문서 + 점검 체크리스트 + README 갱신 (실제 배포는 직접)

B) 가이드 + Vercel 설정 파일 보강(vercel.json 등) + 환경변수 정리 문서

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: A,B 둘다
