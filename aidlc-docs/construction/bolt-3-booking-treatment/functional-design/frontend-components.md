# Frontend Components — bolt-3-booking-treatment

## 라우트 구조

```
app/admin/(protected)/
├── treatments/
│   ├── page.tsx              # 시술 종류 목록 (테이블)
│   ├── new/page.tsx          # 시술 종류 등록
│   ├── [id]/edit/page.tsx    # 시술 종류 수정
│   └── actions.ts            # Server Actions
└── appointments/
    ├── page.tsx              # 주간 캘린더 (?week=)
    ├── new/page.tsx          # 예약 등록 (?date=&time= 프리필)
    ├── [id]/page.tsx         # 예약 상세 + 상태 변경
    ├── [id]/edit/page.tsx    # 예약 변경
    └── actions.ts            # Server Actions
```

---

## 시술 종류 관리

### TreatmentsPage (`treatments/page.tsx`)
- Server Component. treatment_types 전체 조회 → 테이블.
- 컬럼: 이름, 소요시간, 기본가격, 권장주기, [수정][삭제]
- [+ 시술 등록] 버튼

### TreatmentForm (`components/treatments/TreatmentForm.tsx`)
- Client Component. 등록/수정 공용.
- 필드: 이름(text), 소요시간(number, 분), 기본가격(number, 원), 권장주기(number, 일, 선택)
- `data-testid`: `treatment-form`, `treatment-form-name-input`, `treatment-form-submit-button`

### DeleteTreatmentButton (`components/treatments/DeleteTreatmentButton.tsx`)
- 삭제 확인 → deleteTreatmentAction. 참조 중이면 에러 표시.

---

## 예약 관리

### AppointmentsPage (`appointments/page.tsx`)
| 항목 | 내용 |
|------|------|
| 유형 | Server Component |
| Props | `searchParams: { week?: string }` (주 시작 월요일) |
| 책임 | 해당 주 예약 조회 → WeekCalendar 렌더 |

```
주간 네비게이션: [← 이전 주] [오늘] [다음 주 →]  현재 주 표시
<WeekCalendar week={} appointments={} />
[+ 예약 등록] 버튼
```

### WeekCalendar (`components/appointments/WeekCalendar.tsx`)
| 항목 | 내용 |
|------|------|
| 유형 | Client Component (슬롯 클릭 상호작용) |
| Props | `weekStart: string`, `appointments: Appointment[]` |

**그리드 구조** (Tailwind):
```
        월   화   수   목   금   토   일
10:00  [  ] [예약][  ] ...
10:30  [  ] [  ] [  ] ...
...
19:30  [  ] [  ] [  ] ...
```
- 행: 30분 슬롯 (slots.ts에서 생성)
- 열: 7일
- 빈 슬롯 클릭 → `/admin/appointments/new?date=YYYY-MM-DD&time=HH:mm`
- 예약 셀 클릭 → `/admin/appointments/[id]`
- 예약 셀: 회원명 + 시술명, 상태별 색상 (pending=브랜드, completed=초록, cancelled=회색취소선)
- `data-testid`: `week-calendar`, `calendar-slot-{date}-{time}`, `calendar-appointment-{id}`

### AppointmentForm (`components/appointments/AppointmentForm.tsx`)
| 항목 | 내용 |
|------|------|
| 유형 | Client Component (등록/수정 공용) |
| Props | `members`, `treatments`, `appointment?`, `defaultDate?`, `defaultTime?`, `action` |

**필드**:
- 회원 선택 (select, Bolt 2 members 목록)
- 시술 종류 선택 (select, treatment_types)
- 날짜 (date input)
- 시간 슬롯 (select, 10:00~19:30 30분 단위)
- 메모 (textarea, 선택)

`data-testid`: `appointment-form`, `appointment-form-member-select`, `appointment-form-treatment-select`, `appointment-form-date-input`, `appointment-form-time-select`, `appointment-form-submit-button`, `appointment-form-error`

### AppointmentDetailPage (`appointments/[id]/page.tsx`)
- 예약 정보 표시 (회원, 시술, 일시, 상태, 메모)
- pending 상태일 때: [완료 처리] [취소] [변경] 버튼
- AppointmentStatusActions (Client) — 상태 변경 버튼들

### AppointmentStatusActions (`components/appointments/AppointmentStatusActions.tsx`)
- [완료] → updateAppointmentStatusAction(id, 'completed')
- [취소] → confirm 후 updateAppointmentStatusAction(id, 'cancelled')
- `data-testid`: `appointment-complete-button`, `appointment-cancel-button`

---

## 공통 유틸

### `lib/booking/slots.ts`
```typescript
export const BUSINESS_START = '10:00'
export const BUSINESS_END = '20:00'
export const SLOT_MINUTES = 30

export function generateSlots(): string[]  // ['10:00', '10:30', ..., '19:30']
export function getWeekStart(date: Date): string  // 해당 주 월요일 YYYY-MM-DD
export function getWeekDays(weekStart: string): string[]  // 7일 배열
export function combineDateTime(date: string, time: string): string  // ISO
```

---

## 사이드바 수정

`components/admin/AdminSidebar.tsx` navItems에 추가:
```typescript
{ label: '예약 관리', href: '/admin/appointments' },
{ label: '시술 종류', href: '/admin/treatments' },
```

순서: 대시보드 → 회원 관리 → 예약 관리 → 시술 종류
