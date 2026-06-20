# Code Generation Plan — bolt-3-booking-treatment

> 단일 진실 공급원. 각 단계 완료 시 [x] 체크.
> 범위: 시술 종류 관리 + 예약 관리 (시술 내역은 Bolt 3.5).

## 단위 컨텍스트

| 항목 | 내용 |
|------|------|
| Unit | bolt-3-booking-treatment |
| 의존성 | Bolt 1(인증/셸/Supabase), Bolt 2(members) |
| NFR | Bolt 1/2 패턴 재사용으로 SKIP |

---

## 실행 단계

### Step 1: DB 마이그레이션 + 타입
- [x] `supabase/migrations/003_treatment_interval_and_rls.sql`
  - `treatment_types.recommended_interval_days` 컬럼 [Q4]
  - treatment_types, appointments RLS 정책 [SECURITY-06]
- [x] `types/database.ts` — TreatmentType에 recommended_interval_days 추가

### Step 2: 슬롯/주간 유틸 + 검증 스키마
- [x] `lib/booking/slots.ts` — 슬롯 생성, 주간 계산, 날짜시간 결합
- [x] `lib/validations/treatment.ts` — Zod treatmentSchema
- [x] `lib/validations/appointment.ts` — Zod appointmentSchema (슬롯 검증)

### Step 3: 시술 종류 — Server Actions + 화면
- [x] `app/admin/(protected)/treatments/actions.ts` — create/update/delete
- [x] `app/admin/(protected)/treatments/page.tsx` — 목록 테이블
- [x] `app/admin/(protected)/treatments/new/page.tsx`
- [x] `app/admin/(protected)/treatments/[id]/edit/page.tsx`
- [x] `components/treatments/TreatmentForm.tsx`
- [x] `components/treatments/DeleteTreatmentButton.tsx`

### Step 4: 예약 — Server Actions
- [x] `app/admin/(protected)/appointments/actions.ts`
  - createAppointmentAction (슬롯 충돌 검사 [BR-APT-03])
  - updateAppointmentAction (변경)
  - updateAppointmentStatusAction (완료/취소 [BR-APT-05])

### Step 5: 예약 — 주간 캘린더
- [x] `components/appointments/WeekCalendar.tsx` — Tailwind 그리드
- [x] `app/admin/(protected)/appointments/page.tsx` — 주간 뷰 + 네비게이션

### Step 6: 예약 — 등록/변경/상세
- [x] `components/appointments/AppointmentForm.tsx` — 등록/수정 공용
- [x] `app/admin/(protected)/appointments/new/page.tsx`
- [x] `app/admin/(protected)/appointments/[id]/edit/page.tsx`
- [x] `app/admin/(protected)/appointments/[id]/page.tsx` — 상세
- [x] `components/appointments/AppointmentStatusActions.tsx`

### Step 7: 사이드바 메뉴 추가
- [x] `components/admin/AdminSidebar.tsx` 수정 — "예약 관리", "시술 종류" (in-place)

### Step 8: 테스트
- [x] `tests/unit/slots.test.ts` — 슬롯 생성/주간 계산
- [x] `tests/unit/treatment.validation.test.ts`
- [x] `tests/unit/appointment.validation.test.ts`
- [x] `tests/e2e/booking.spec.ts` — 미인증 보호 + 캘린더 진입

### Step 9: 빌드/테스트 검증 + 문서
- [x] `pnpm test` + `pnpm build` 실제 실행
- [x] `aidlc-docs/construction/bolt-3-booking-treatment/code/code-summary.md`

---

## 요구사항 추적

| 요구사항 | 단계 |
|----------|------|
| FR-03 시술 종류 관리 | Step 3 |
| FR-02 예약 캘린더/등록/변경/취소 | Step 4, 5, 6 |
| 단일 슬롯 충돌 검사 | Step 4 |
| 권장주기 컬럼 (FR-04 준비) | Step 1 |

## 사용자 작업 (배포 시)
- Supabase SQL Editor에서 `003_treatment_interval_and_rls.sql` 실행

## 예상 규모
약 20개 파일 (신규 19 + 수정 1: AdminSidebar, types 수정 포함)
