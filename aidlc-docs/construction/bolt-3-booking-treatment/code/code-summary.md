# Code Summary — bolt-3-booking-treatment

> 검증: 단위 테스트 40/40 통과, 프로덕션 빌드 성공 (15 라우트).
> 범위: 시술 종류 관리 + 예약 관리 (시술 내역은 Bolt 3.5).

## 생성/수정 파일

### DB (Step 1)
| 파일 | 상태 | 역할 |
|------|------|------|
| `supabase/migrations/003_treatment_interval_and_rls.sql` | 생성 | recommended_interval_days + RLS(treatment_types/appointments) |
| `types/database.ts` | 수정 | TreatmentType에 recommended_interval_days 추가 |

### 유틸/검증 (Step 2)
| 파일 | 역할 |
|------|------|
| `lib/booking/slots.ts` | 슬롯 생성, 주간 계산, 날짜시간 결합/추출 |
| `lib/validations/treatment.ts` | Zod treatmentSchema |
| `lib/validations/appointment.ts` | Zod appointmentSchema (슬롯 검증) |

### 시술 종류 (Step 3)
| 파일 | 역할 |
|------|------|
| `app/admin/(protected)/treatments/actions.ts` | create/update/delete (중복명·사용중 처리) |
| `app/admin/(protected)/treatments/page.tsx` | 목록 테이블 |
| `app/admin/(protected)/treatments/new/page.tsx` | 등록 |
| `app/admin/(protected)/treatments/[id]/edit/page.tsx` | 수정 |
| `components/treatments/TreatmentForm.tsx` | 공용 폼 |
| `components/treatments/DeleteTreatmentButton.tsx` | 삭제(참조 시 에러) |

### 예약 (Step 4~6)
| 파일 | 역할 |
|------|------|
| `app/admin/(protected)/appointments/actions.ts` | create/update/status (슬롯 충돌 검사) |
| `app/admin/(protected)/appointments/page.tsx` | 주간 캘린더 + 네비게이션 |
| `components/appointments/WeekCalendar.tsx` | Tailwind 주간 그리드 |
| `components/appointments/AppointmentForm.tsx` | 등록/수정 공용 폼 |
| `app/admin/(protected)/appointments/new/page.tsx` | 등록 (슬롯 프리필) |
| `app/admin/(protected)/appointments/[id]/edit/page.tsx` | 변경(pending만) |
| `app/admin/(protected)/appointments/[id]/page.tsx` | 상세 |
| `components/appointments/AppointmentStatusActions.tsx` | 완료/취소/변경 |

### 셸 (Step 7)
| 파일 | 변경 |
|------|------|
| `components/admin/AdminSidebar.tsx` | "예약 관리", "시술 종류" 메뉴 추가 |

### 테스트 (Step 8)
| 파일 | 케이스 |
|------|--------|
| `tests/unit/slots.test.ts` | 8 |
| `tests/unit/treatment.validation.test.ts` | 5 |
| `tests/unit/appointment.validation.test.ts` | 5 |
| `tests/e2e/booking.spec.ts` | 3 시나리오 |

## 라우트 (신규 7개)

```
/admin/treatments              시술 종류 목록
/admin/treatments/new          등록
/admin/treatments/[id]/edit    수정
/admin/appointments            주간 캘린더
/admin/appointments/new        예약 등록
/admin/appointments/[id]       상세 (완료/취소/변경)
/admin/appointments/[id]/edit  변경
```

## 핵심 로직

| 기능 | 구현 |
|------|------|
| 단일 슬롯 충돌 검사 | 동일 scheduled_at + status≠cancelled 존재 시 차단 (수정 시 자기 제외) |
| 상태 전이 | pending→completed/cancelled (eq('status','pending')로 종료상태 보호) |
| 주간 캘린더 | 슬롯(행) × 7일(열) Tailwind 테이블, 빈 슬롯/예약 클릭 분기 |
| 시술 삭제 보호 | FK 위반(23503) → "사용 중인 시술" 에러 |

## 검증 결과

- ✅ 단위 테스트 40/40 통과 (Bolt1:9 + Bolt2:13 + Bolt3:18)
- ✅ 프로덕션 빌드 성공 (15 라우트 + 미들웨어)
- ✅ TypeScript strict + ESLint 통과
- 빌드 중 수정: 상세 페이지 오타(`apt.mem>memo` → `apt.memo`)

## 사용자 작업 (배포 시)

- Supabase SQL Editor에서 `003_treatment_interval_and_rls.sql` 실행

## Security Compliance

SECURITY-05(Zod), 06(RLS 정책 추가), 08(미들웨어 보호 상속), 09(중복/FK generic 에러), 15(try/catch) 적용.

## 다음

**Bolt 3.5 — 시술 내역**: 예약 완료 시 visit_history 자동 생성(Q3), 회원별 히스토리, 재방문 권장 시점 표시(Q4).
