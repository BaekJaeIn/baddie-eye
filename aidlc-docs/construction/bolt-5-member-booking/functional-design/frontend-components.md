# Frontend Components — bolt-5-member-booking

## 라우트 구조

```
app/(member)/
├── booking/
│   ├── page.tsx              # 예약 신청 (날짜/시술/슬롯 선택)
│   └── actions.ts            # requestAppointmentAction
└── me/
    └── appointments/
        ├── page.tsx          # 내 예약 목록
        ├── [id]/
        │   └── edit/page.tsx # 예약 변경
        └── actions.ts        # cancelAppointmentAction, updateMemberAppointmentAction

app/admin/(protected)/appointments/   # Bolt 3 확장
├── [id]/page.tsx             # (수정) requested 승인/거절 버튼
└── actions.ts                # (수정) approve/reject 액션
```

---

## 고객 측

### BookingPage (`(member)/booking/page.tsx`)
| 항목 | 내용 |
|------|------|
| 유형 | Server Component (시술 목록 조회) + Client(슬롯 선택) |
| 책임 | 시술 선택 → 날짜 선택 → 가용 슬롯 표시 → 신청 |

흐름:
```
1. 시술 종류 선택 (treatment_types 읽기 — RLS 허용)
2. 날짜 선택 (오늘 ~ +84일)
3. 해당 날짜 가용 슬롯 조회 (get_taken_slots → 가용 계산)
4. 슬롯 선택 + 메모 → requestAppointmentAction
5. 신청 완료 → /me/appointments
```

### BookingForm (`components/booking/BookingForm.tsx`)
- Client Component
- 시술 select, 날짜 input(min=today, max=today+84d), 가용 슬롯 버튼 그리드, 메모
- 날짜 변경 시 가용 슬롯 갱신 (Server Action 또는 route fetch)
- `data-testid`: `booking-form`, `booking-treatment-select`, `booking-date-input`, `booking-slot-{time}`, `booking-submit`, `booking-error`

### SlotPicker (`components/booking/SlotPicker.tsx`)
- 가용 슬롯을 버튼 그리드로. 점유/과거 슬롯은 비활성.
- 선택된 슬롯 하이라이트

### MyAppointmentsPage (`(member)/me/appointments/page.tsx`)
- 내 예약 목록 (RLS 자기 것)
- 상태별 배지(승인대기/확정/완료/취소)
- 예정 예약: [변경][취소] (24h 전 + requested/pending)
- 지난/취소 예약: 읽기 전용

### MemberAppointmentStatusBadge (`components/booking/StatusBadge.tsx`)
- status → 라벨/색상 (requested=amber, pending=brand, completed=green, cancelled=gray)
- Admin/고객 공용 가능

### CancelAppointmentButton (`components/booking/CancelAppointmentButton.tsx`)
- Client. confirm → cancelAppointmentAction
- 24h 미만이면 비활성 + 안내
- `data-testid="member-cancel-appointment-button"`

### EditMemberAppointmentPage (`(member)/me/appointments/[id]/edit/page.tsx`)
- 변경 폼 (BookingForm 재사용, 기존값 프리필)
- 24h 미만 또는 종료상태면 차단 → 목록으로

---

## 고객 Server Actions

### requestAppointmentAction (`(member)/booking/actions.ts`)
```typescript
'use server'
// 1. 세션/연결 확인
// 2. Zod 검증 (booking schema)
// 3. supabase.rpc('request_appointment', {p_treatment, p_at, p_memo})
// 4. 에러: SLOT_TAKEN/PAST/TOO_FAR/NOT_MEMBER → 메시지 변환
// 5. /me/appointments 리다이렉트
```

### cancelAppointmentAction / updateMemberAppointmentAction (`me/appointments/actions.ts`)
```typescript
// cancel: 24h + status 검사 → status='cancelled'
// update: 24h + status 검사 + 슬롯 충돌 → scheduled_at/treatment/memo 갱신
```

---

## 마이페이지 링크 추가 (`(member)/me/page.tsx` 수정)

상단에 액션 버튼:
```
[+ 예약하기] → /booking
[내 예약]    → /me/appointments
```

---

## Admin 측 (Bolt 3 확장)

### 예약 상세 수정 (`admin/(protected)/appointments/[id]/page.tsx`)
- status='requested'일 때 [승인][거절] 버튼 (AppointmentStatusActions 확장 또는 신규)
- 기존 pending [완료][취소][변경]은 유지

### Admin 액션 (`admin/(protected)/appointments/actions.ts` 수정)
```typescript
// approveAppointmentAction(id): requested → pending
// rejectAppointmentAction(id): requested → cancelled
```

### WeekCalendar (`components/appointments/WeekCalendar.tsx` 수정)
- requested 상태 색상 추가 (amber) — 승인 대기 시각적 구분

### 대시보드 (`admin/(protected)/dashboard/page.tsx` 수정, 선택)
- 승인 대기(requested) 예약 건수/링크 표시

---

## 검증 스키마

### `lib/validations/booking.ts`
```typescript
export const memberBookingSchema = z.object({
  treatment_type_id: z.string().uuid('시술을 선택해주세요'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().refine(isValidSlot, '시간을 선택해주세요'),
  memo: z.preprocess(emptyToNull, z.string().max(500).nullable()),
})
```

---

## 슬롯 유틸 확장 (`lib/booking/slots.ts`)
- `MAX_BOOKING_DAYS = 84` 상수 추가
- `isWithinBookingWindow(date): boolean` — 오늘~+84일 검사
- 기존 generateSlots/combineDateTime 재사용

---

## 타입 수정 (`types/database.ts`)
```typescript
export type AppointmentStatus =
  'requested' | 'pending' | 'completed' | 'cancelled'
```
