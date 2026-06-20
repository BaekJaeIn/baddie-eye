# Code Generation Plan — bolt-5-member-booking

> 단일 진실 공급원. 각 단계 완료 시 [x] 체크.

## 단위 컨텍스트

| 항목 | 내용 |
|------|------|
| Unit | bolt-5-member-booking |
| 의존성 | Bolt 1~4 (슬롯/인증/members/appointments/treatment_types) |
| NFR | 패턴 재사용 SKIP |
| 양면 영향 | 고객(신규) + Admin(Bolt 3 수정) |

---

## 실행 단계

### Step 1: DB 마이그레이션 + 타입
- [x] `supabase/migrations/006_member_booking.sql`
  - status CHECK에 'requested' 추가
  - appointments RLS: admin-or-owner(member)
  - treatment_types RLS: admin 쓰기 + 인증 사용자 읽기
  - get_taken_slots() 함수 (SECURITY DEFINER)
  - request_appointment() 함수 (SECURITY DEFINER)
- [x] `types/database.ts` — AppointmentStatus에 'requested' 추가

### Step 2: 슬롯 유틸 + 검증
- [x] `lib/booking/slots.ts` 수정 — MAX_BOOKING_DAYS, isWithinBookingWindow
- [x] `lib/validations/booking.ts` — memberBookingSchema
- [x] `lib/booking/status.ts` — 상태 라벨/색상 매핑(공용)

### Step 3: 고객 예약 신청
- [x] `app/(member)/booking/actions.ts` — requestAppointmentAction
- [x] `app/(member)/booking/page.tsx` — 시술/날짜/슬롯 선택
- [x] `components/booking/BookingForm.tsx`
- [x] `components/booking/SlotPicker.tsx`
- [x] `app/(member)/booking/slots/route.ts` — 날짜별 가용 슬롯 조회 API

### Step 4: 내 예약 목록 + 취소/변경
- [x] `app/(member)/me/appointments/actions.ts` — cancel/update
- [x] `app/(member)/me/appointments/page.tsx`
- [x] `app/(member)/me/appointments/[id]/edit/page.tsx`
- [x] `components/booking/StatusBadge.tsx`
- [x] `components/booking/CancelAppointmentButton.tsx`

### Step 5: 마이페이지 링크
- [x] `app/(member)/me/page.tsx` 수정 — 예약하기/내 예약 버튼

### Step 6: Admin 승인/거절 (Bolt 3 확장)
- [x] `app/admin/(protected)/appointments/actions.ts` 수정 — approve/reject
- [x] `app/admin/(protected)/appointments/[id]/page.tsx` 수정 — requested 승인/거절 버튼 + 상태 라벨
- [x] `components/appointments/WeekCalendar.tsx` 수정 — requested 색상
- [x] `app/admin/(protected)/dashboard/page.tsx` 수정 — 승인 대기 건수

### Step 7: 테스트
- [x] `tests/unit/booking.validation.test.ts`
- [x] `tests/unit/booking-window.test.ts` — isWithinBookingWindow
- [x] `tests/e2e/member-booking.spec.ts` — 미인증 보호

### Step 8: 빌드/테스트 검증 + 문서
- [x] `pnpm test` + `pnpm build` 실제 실행
- [x] `aidlc-docs/construction/bolt-5-member-booking/code/code-summary.md`

---

## 요구사항 추적

| 요구사항 | 단계 |
|----------|------|
| 가용 시간 조회 | Step 1,3 |
| 예약 신청 (승인 대기) | Step 1,3 |
| 내 예약 조회 | Step 4 |
| 취소/변경 (24h) | Step 4 |
| 원장 승인/거절 | Step 6 |

## 사용자 작업 (배포 시)
- 마이그레이션 006 실행

## 예상 규모
약 22개 파일 (신규 16 + 수정 6: slots/types/me/appointments actions+page/calendar/dashboard)
