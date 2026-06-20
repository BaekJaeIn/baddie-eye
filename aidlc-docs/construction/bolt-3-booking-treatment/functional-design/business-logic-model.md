# Business Logic Model — bolt-3-booking-treatment

## 설계 결정 (사용자 답변)

| 질문 | 결정 |
|------|------|
| Q1 캘린더 | 주간 뷰 직접 구현 (Tailwind 그리드, 라이브러리 없음) |
| Q2 시간 입력 | 영업시간 내 30분 단위 슬롯 선택 |
| Q3 예약↔시술내역 | 예약 '완료' 시 시술 내역 자동 생성 (방향 결정, 구현은 Bolt 3.5) |
| Q4 재방문 권장 | 시술 종류별 권장 주기 (treatment_types 컬럼 추가) |
| Q5 범위 | **시술 종류 + 예약 관리까지** (시술 내역은 Bolt 3.5 분리) |

## Bolt 3 범위 확정

| 포함 (Bolt 3) | 제외 (Bolt 3.5) |
|---------------|-----------------|
| 시술 종류 CRUD (권장주기 포함) | 시술 내역(visit_history) 기록 |
| 예약 주간 캘린더 뷰 | 예약 완료 시 시술 내역 자동 생성 |
| 예약 등록/변경/취소 | 회원별 시술 히스토리 |
| 예약 상태 변경 (예약→완료/취소) | 재방문 권장 시점 표시 |

> Q3(자동 생성)·Q4(권장주기 표시)는 시술 내역 기반이므로 Bolt 3.5에서 구현.
> 단, **권장주기 컬럼은 Bolt 3 마이그레이션에 포함** (시술 종류 관리의 일부).

---

## 영업시간 / 슬롯 정의 (상수)

```
영업 시작: 10:00
영업 종료: 20:00
슬롯 단위: 30분
→ 슬롯: 10:00, 10:30, 11:00, ..., 19:30 (20개)
```

`lib/booking/slots.ts`에 상수로 정의. 추후 설정화 가능.

---

## 1. 시술 종류 관리 플로우 (CRUD)

```
[/admin/treatments] 시술 종류 목록 (테이블)
    |
    +-- [등록] → createTreatmentAction
    +-- [수정] → updateTreatmentAction
    +-- [삭제] → deleteTreatmentAction
              | 예약/시술내역에서 참조 중이면 (ON DELETE RESTRICT)
              | → "사용 중인 시술은 삭제할 수 없습니다" generic 에러
```

필드: 이름, 소요시간(분), 기본가격, **권장 재방문 주기(일)**.

---

## 2. 예약 주간 캘린더 플로우

```
[/admin/appointments?week=YYYY-MM-DD] 주간 뷰
    |
    | 해당 주(월~일) 예약 조회
    | scheduled_at이 주 범위 내인 appointments
    v
[주간 그리드 렌더링]
    | 행: 30분 슬롯 (10:00~19:30)
    | 열: 7일 (월~일)
    | 셀: 예약 있으면 회원명+시술명 표시, 없으면 빈 슬롯
    |
    +-- 빈 슬롯 클릭 → 예약 등록 (해당 날짜+시간 프리필)
    +-- 예약 클릭 → 예약 상세/변경
    +-- [이전 주] [다음 주] [오늘] 네비게이션
```

---

## 3. 예약 등록 플로우

```
[예약 등록 폼]
    | 회원 선택 (Bolt 2 members에서)
    | 시술 종류 선택 (treatment_types)
    | 날짜 선택 + 슬롯 선택 (30분 단위)
    | 메모 (선택)
    v
[createAppointmentAction]
    | 1. Zod 검증
    | 2. 슬롯 충돌 검사 [단일 슬롯 — BR-APT]
    |    같은 시간대 'pending' 예약 있으면 → "이미 예약된 시간입니다"
    | 3. insert (status='pending')
    | 4. revalidatePath
    v
[캘린더로 복귀]
```

**슬롯 충돌 검사**: 1인 운영 단일 슬롯이므로, 동일 `scheduled_at`에
취소되지 않은(status != 'cancelled') 예약이 있으면 중복 등록 차단.

---

## 4. 예약 상태 변경 플로우

```
[예약 상세]
    | 현재 상태: pending
    |
    +-- [완료 처리] → updateAppointmentStatusAction('completed')
    |     (Bolt 3.5에서 시술 내역 자동 생성 연결 예정)
    +-- [취소] → updateAppointmentStatusAction('cancelled')
    +-- [예약 변경] → 날짜/시간/시술 수정 (updateAppointmentAction)
```

상태 전이 규칙:
```
pending → completed   (완료 처리)
pending → cancelled   (취소)
completed/cancelled → (변경 불가, 종료 상태)
```

---

## 5. 스키마 변경 (마이그레이션 003)

```sql
-- 시술 종류별 권장 재방문 주기 [Q4]
ALTER TABLE treatment_types
  ADD COLUMN recommended_interval_days INTEGER;  -- NULL 허용 (미설정 가능)

-- 예약 조회 성능 (주간 범위 + 상태)
-- idx_appointments_scheduled_at은 Bolt 1에 이미 존재

-- RLS 정책 (Bolt 2 members와 동일 패턴)
-- treatment_types, appointments에 authenticated 전체 접근
```
