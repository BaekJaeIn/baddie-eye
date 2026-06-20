# Business Logic Model — bolt-5-member-booking

## 설계 결정 (사용자 답변)

| 질문 | 결정 |
|------|------|
| Q1 신청 처리 | 원장 승인 대기 (requested → 승인 → pending) |
| Q2 예약 가능 범위 | 오늘부터 12주(84일) 앞까지 |
| Q3 취소/변경 | 예약 시간 24시간 전까지만 |
| Q4 당일 예약 | 허용 (과거 시간 제외) |

---

## 1. 예약 상태 흐름 (requested 추가)

```
[고객 신청] → requested (승인 대기)
                |
       [원장 승인] → pending (확정)  ──[원장 완료]→ completed
                |                          (Bolt 3)
       [원장 거절] → cancelled
                |
       [고객/원장 취소] → cancelled
```

**상태 정의**:
| status | 의미 | 비고 |
|--------|------|------|
| requested | 고객 신청, 승인 대기 | Bolt 5 신규 |
| pending | 확정된 예약 (원장 승인 or 원장 직접 등록) | Bolt 3 |
| completed | 시술 완료 | Bolt 3 |
| cancelled | 취소/거절 | — |

**전이 규칙**:
- 고객 신청 → requested
- 원장: requested → pending(승인) / cancelled(거절)
- 원장: pending → completed(완료, Bolt 3) / cancelled
- 고객/원장: requested·pending → cancelled (24h 전, 고객만 제한)
- 원장 직접 등록(Bolt 3)은 pending으로 바로 생성 (승인 불필요)

---

## 2. 가용성(빈 슬롯) 조회 [SECURITY-08]

고객은 타 회원 예약 상세를 보면 안 되므로, **점유 시각만** 반환하는
SECURITY DEFINER 함수 사용:

```sql
get_taken_slots(p_from, p_to) RETURNS scheduled_at[]
  -- status IN ('requested','pending','completed')인 예약의 시각만 반환
  -- 회원/시술 정보 없음
```

고객 화면: 전체 슬롯(generateSlots) − 점유 슬롯 = 예약 가능 슬롯.

> requested(승인 대기)도 점유로 간주 → 중복 신청 방지. 거절되면 다시 열림.

---

## 3. 예약 신청 플로우

```
[고객] /booking — 날짜 선택 + 시술 선택 + 빈 슬롯 선택
    |
    | requestAppointmentAction
    v
[SECURITY DEFINER 함수 request_appointment(treatment_id, scheduled_at, memo)]
    | 1. auth.uid() → 연결된 member 확인 (없으면 에러)
    | 2. 시간 규칙 검사:
    |    - 과거 시각 불가 [Q4: 당일 OK, 과거 X]
    |    - 12주(84일) 이내만 [Q2]
    |    - 유효한 슬롯(30분 정렬, 영업시간)
    | 3. 슬롯 충돌 검사 (requested/pending/completed 있으면 SLOT_TAKEN)
    | 4. insert status='requested', member_id=내 회원
    v
[신청 완료 → 내 예약 목록]
```

함수로 처리하는 이유: 충돌 검사 + insert 원자성, 권한 안전(자기 member로만).

---

## 4. 내 예약 조회 / 취소 / 변경

```
[/me/appointments] 내 예약 목록 (RLS: 자기 member_id)
    | 상태별 표시 (신청중/확정/완료/취소)
    |
    +-- [취소] → cancelAppointmentAction
    |     24h 전 + status IN (requested,pending) → cancelled [Q3]
    +-- [변경] → 취소와 동일 제약, 날짜/시간/시술 수정
    |     (변경 시 슬롯 재충돌 검사)
```

**24시간 규칙** [Q3]: `scheduled_at - now() >= 24h` 일 때만 취소/변경 허용.
미만이면 "예약 24시간 전까지만 변경할 수 있습니다".

---

## 5. Admin 측 변경 (Bolt 3 확장)

| 변경 | 내용 |
|------|------|
| 상태 표시 | requested 색상/라벨 추가 (캘린더, 상세, 목록) |
| 승인/거절 | 예약 상세에 requested일 때 [승인][거절] 버튼 |
| 승인 | requested → pending |
| 거절 | requested → cancelled |
| 대시보드 | 승인 대기(requested) 건수/목록 표시 |

---

## 6. RLS 조정 (마이그레이션 006)

```sql
-- appointments: admin 전체 OR 고객 자기 member 예약
DROP POLICY "appointments admin only";
CREATE POLICY appointments_access ON appointments FOR ALL TO authenticated
USING (
  (auth.jwt()->'app_metadata'->>'role')='admin'
  OR member_id IN (SELECT id FROM members WHERE user_id=auth.uid())
)
WITH CHECK ( ... 동일 ... );

-- treatment_types: admin 전체 OR 고객 읽기
DROP POLICY "treatment_types admin only";
CREATE POLICY treatment_types_admin_write ON treatment_types FOR ALL TO authenticated
  USING ((auth.jwt()->'app_metadata'->>'role')='admin')
  WITH CHECK ((auth.jwt()->'app_metadata'->>'role')='admin');
CREATE POLICY treatment_types_member_read ON treatment_types FOR SELECT TO authenticated
  USING (true);  -- 모든 인증 사용자 읽기 가능

-- status CHECK에 requested 추가
ALTER TABLE appointments DROP CONSTRAINT ... ;
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check
  CHECK (status IN ('requested','pending','completed','cancelled'));

-- 함수: get_taken_slots, request_appointment (SECURITY DEFINER)
```
