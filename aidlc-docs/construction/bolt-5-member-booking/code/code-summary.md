# Code Summary — bolt-5-member-booking

> 검증: 단위 테스트 68/68 통과, 프로덕션 빌드 성공 (25 라우트).

## 생성/수정 파일

### DB (Step 1)
| 파일 | 상태 | 역할 |
|------|------|------|
| `supabase/migrations/006_member_booking.sql` | 생성 | requested 상태 + appointments/treatment_types RLS + get_taken_slots/request_appointment 함수 |
| `types/database.ts` | 수정 | AppointmentStatus에 'requested' 추가 |

### 유틸/검증 (Step 2)
| 파일 | 상태 |
|------|------|
| `lib/booking/slots.ts` | 수정 (MAX_BOOKING_DAYS, isWithinBookingWindow, bookingDateBounds) |
| `lib/validations/booking.ts` | 생성 (memberBookingSchema) |
| `lib/booking/status.ts` | 생성 (상태 라벨/색상 공용) |

### 고객 예약 신청 (Step 3)
| 파일 | 상태 |
|------|------|
| `app/(member)/booking/actions.ts` | 생성 (requestAppointmentAction → RPC) |
| `app/(member)/booking/page.tsx` | 생성 |
| `app/(member)/booking/slots/route.ts` | 생성 (가용 슬롯 API) |
| `components/booking/BookingForm.tsx` | 생성 (신청/변경 공용) |
| `components/booking/SlotPicker.tsx` | 생성 |

### 내 예약 + 취소/변경 (Step 4)
| 파일 | 상태 |
|------|------|
| `app/(member)/me/appointments/actions.ts` | 생성 (cancel/update, 24h 규칙) |
| `app/(member)/me/appointments/page.tsx` | 생성 |
| `app/(member)/me/appointments/[id]/edit/page.tsx` | 생성 |
| `components/booking/StatusBadge.tsx` | 생성 |
| `components/booking/CancelAppointmentButton.tsx` | 생성 |

### 마이페이지 (Step 5)
| 파일 | 변경 |
|------|------|
| `app/(member)/me/page.tsx` | 예약하기/내 예약 버튼 추가 |

### Admin 확장 (Step 6)
| 파일 | 변경 |
|------|------|
| `app/admin/(protected)/appointments/actions.ts` | approve/reject 액션 추가 |
| `app/admin/(protected)/appointments/[id]/page.tsx` | requested 승인/거절 + 공용 상태 매핑 |
| `components/appointments/AppointmentStatusActions.tsx` | status별 분기(승인/거절 vs 완료/변경/취소) |
| `components/appointments/WeekCalendar.tsx` | requested 색상(공용 매핑) |
| `app/admin/(protected)/dashboard/page.tsx` | 승인 대기 배너 |

### 테스트 (Step 7)
| 파일 | 케이스 |
|------|--------|
| `tests/unit/booking.validation.test.ts` | 4 |
| `tests/unit/booking-window.test.ts` | 5 |
| `tests/e2e/member-booking.spec.ts` | 3 시나리오 |

## 라우트 (신규 4개)

```
/booking              예약 신청 (시술/날짜/슬롯)
/booking/slots        가용 슬롯 조회 API
/me/appointments      내 예약 목록
/me/appointments/[id]/edit  예약 변경
```

## 핵심 로직

| 기능 | 구현 |
|------|------|
| 가용 슬롯 | get_taken_slots(SECURITY DEFINER) → 점유 시각만, 앱에서 전체−점유−과거 |
| 예약 신청 | request_appointment(SECURITY DEFINER) → 충돌/시간 검사 + requested 생성 원자 처리 |
| 24h 취소/변경 | 서버에서 scheduled_at−now ≥ 24h 강제 |
| 승인 워크플로우 | requested →(승인) pending →(완료) completed / →(거절·취소) cancelled |
| 상태 일관성 | lib/booking/status.ts 공용 라벨·색상 (Admin/고객) |

## 보안

| 규칙 | 적용 |
|------|------|
| SECURITY-05 | booking Zod + 함수 내 재검증 |
| SECURITY-06 | RLS admin-or-owner, 함수 EXECUTE는 authenticated |
| SECURITY-08 | 가용성 함수가 타 회원 정보 비노출, 24h·충돌 서버 강제 |
| SECURITY-09 | 함수 예외 → generic 메시지 매핑 |
| SECURITY-15 | try/catch |

## 검증 결과

- ✅ 단위 테스트 68/68 통과 (Bolt1~4: 59 + Bolt5: 9)
- ✅ 프로덕션 빌드 성공 (25 라우트 + 미들웨어)
- ✅ TypeScript strict + ESLint 통과

## 사용자 작업 (배포 시)

- Supabase SQL Editor에서 `006_member_booking.sql` 실행

## SPEC.md FR-10 완료

예약 가능 시간 조회 + 신청 + 변경/취소 — 완료 (원장 승인 워크플로우 포함).

## 다음

**Bolt 6 — 알림**: 예약 리마인더(웹푸시).
