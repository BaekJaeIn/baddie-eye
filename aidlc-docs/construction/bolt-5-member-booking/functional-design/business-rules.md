# Business Rules — bolt-5-member-booking

## 예약 신청 규칙

| ID | 규칙 |
|----|------|
| BR-BK-01 | 고객은 연결된 회원(user_id)으로만 예약 신청 가능 |
| BR-BK-02 | 신청 예약은 status='requested'로 생성 |
| BR-BK-03 | 과거 시각 예약 불가 (당일 미래 시간은 OK) [Q4] |
| BR-BK-04 | 오늘부터 84일(12주) 이내만 신청 가능 [Q2] |
| BR-BK-05 | 유효한 슬롯만 (영업 10:00~20:00, 30분 정렬) |
| BR-BK-06 | 슬롯 충돌: requested/pending/completed 있으면 신청 불가 (단일 슬롯) |
| BR-BK-07 | 시술 종류 필수 선택 (treatment_types) |

---

## 가용성 조회 규칙 [SECURITY-08]

| ID | 규칙 |
|----|------|
| BR-AV-01 | 점유 슬롯 = status IN (requested,pending,completed)인 예약 시각 |
| BR-AV-02 | 취소(cancelled)된 슬롯은 가용 |
| BR-AV-03 | 점유 조회 함수는 시각만 반환 (회원/시술 정보 비노출) |
| BR-AV-04 | 가용 슬롯 = 전체 슬롯 − 점유 슬롯 − 과거 슬롯 |

---

## 취소 / 변경 규칙 [Q3]

| ID | 규칙 |
|----|------|
| BR-CX-01 | 고객은 자기 예약만 취소/변경 (RLS) |
| BR-CX-02 | status IN (requested, pending)일 때만 취소/변경 가능 |
| BR-CX-03 | 예약 시각 24시간 전까지만 (scheduled_at − now ≥ 24h) |
| BR-CX-04 | 24h 미만이면 "예약 24시간 전까지만 변경/취소할 수 있습니다" |
| BR-CX-05 | completed/cancelled 예약은 취소/변경 불가 |
| BR-CX-06 | 변경 시 새 슬롯 충돌 재검사 (자기 예약 제외) |

---

## 원장 승인 규칙 (Admin, Bolt 3 확장)

| ID | 규칙 |
|----|------|
| BR-AP-01 | requested → pending(승인) / cancelled(거절) |
| BR-AP-02 | 원장 직접 등록 예약은 pending으로 바로 생성 (Bolt 3 유지) |
| BR-AP-03 | 승인 시 슬롯 충돌 재확인 불필요 (신청 시 이미 점유) |
| BR-AP-04 | 거절은 cancelled로 (별도 rejected 상태 안 둠 — 단순화) |

---

## 상태 라벨 / 색상 (UI 일관성)

| status | 라벨 | 색상 |
|--------|------|------|
| requested | 승인대기 | amber |
| pending | 확정 | brand |
| completed | 완료 | green |
| cancelled | 취소 | gray |

---

## RLS 규칙 [SECURITY-06, 08]

| ID | 규칙 |
|----|------|
| BR-RLS-10 | appointments: admin 전체 OR 고객 자기 member 행 |
| BR-RLS-11 | treatment_types: admin 전체 쓰기 + 모든 인증 사용자 읽기 |
| BR-RLS-12 | request_appointment/get_taken_slots: SECURITY DEFINER, EXECUTE는 authenticated |
| BR-RLS-13 | 고객 신청은 함수 경유 (직접 insert도 RLS 통과하나 충돌검사 위해 함수 권장) |

---

## 입력 검증 [SECURITY-05]

| 스키마 | 파일 |
|--------|------|
| memberBookingSchema | `lib/validations/booking.ts` (treatment_id, date, time, memo) |

함수 내부에서도 시간/슬롯 재검증 (이중).

---

## CSP / 보안

추가 외부 도메인 없음 (Bolt 4 CSP 유지).
24h 규칙·슬롯 충돌은 서버(함수)에서 강제 — 클라이언트 우회 불가 [SECURITY-08].
