# Business Rules — bolt-3-booking-treatment

## 시술 종류 (treatment_types) 규칙

| ID | 필드 | 규칙 | 에러 메시지 |
|----|------|------|-------------|
| BR-TRT-01 | name | 필수, 1~50자, 유니크 | "시술명을 입력해주세요" / "이미 등록된 시술명입니다" |
| BR-TRT-02 | duration_min | 필수, 1 이상 정수 | "소요시간은 1분 이상이어야 합니다" |
| BR-TRT-03 | base_price | 필수, 0 이상 정수 | "가격은 0 이상이어야 합니다" |
| BR-TRT-04 | recommended_interval_days | 선택, 1 이상 정수 또는 미설정 | "권장 주기는 1일 이상이어야 합니다" |
| BR-TRT-05 | 삭제 | 예약/시술내역 참조 시 삭제 불가 (ON DELETE RESTRICT) | "사용 중인 시술은 삭제할 수 없습니다" |

---

## 예약 (appointments) 규칙

| ID | 규칙 |
|----|------|
| BR-APT-01 | member_id, treatment_type_id 필수 (유효한 FK) |
| BR-APT-02 | scheduled_at 필수, 영업시간(10:00~20:00) 내 30분 슬롯 |
| BR-APT-03 | 단일 슬롯: 동일 scheduled_at에 cancelled가 아닌 예약 있으면 중복 등록 불가 |
| BR-APT-04 | status 기본값 'pending' |
| BR-APT-05 | 상태 전이: pending → completed 또는 pending → cancelled만 허용 |
| BR-APT-06 | completed/cancelled 상태는 종료 — 재변경 불가 |
| BR-APT-07 | 예약 변경(날짜/시간/시술)은 pending 상태에서만 가능 |
| BR-APT-08 | 슬롯 충돌 검사 시 자기 자신(수정 중인 예약)은 제외 |

---

## 슬롯 규칙 (단일 슬롯)

| ID | 규칙 |
|----|------|
| BR-SLOT-01 | 영업시간: 10:00 ~ 20:00 (마지막 슬롯 19:30) |
| BR-SLOT-02 | 슬롯 단위: 30분 |
| BR-SLOT-03 | 1인 운영이므로 한 슬롯에 예약 1건만 (SPEC.md 확정) |
| BR-SLOT-04 | 과거 시간 슬롯에도 예약 등록 가능 (지난 예약 사후 입력 허용) |

---

## 권한/데이터 접근 규칙 [SECURITY-08, 06]

| ID | 규칙 |
|----|------|
| BR-SEC-30 | 모든 `/admin/treatments/**`, `/admin/appointments/**`는 미들웨어 인증 강제 |
| BR-SEC-31 | treatment_types, appointments에 authenticated RLS 정책 추가 |

```sql
-- 마이그레이션 003에 포함
CREATE POLICY "authenticated admin full access on treatment_types"
  ON treatment_types FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated admin full access on appointments"
  ON appointments FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

---

## 입력 검증 [SECURITY-05]

| 스키마 | 파일 |
|--------|------|
| treatmentSchema | `lib/validations/treatment.ts` |
| appointmentSchema | `lib/validations/appointment.ts` |

appointmentSchema는 scheduled_at이 유효한 30분 슬롯인지 검증.
