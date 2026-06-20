-- ============================================================
-- Baddie Eye — 고객 예약 (Bolt 5)
-- requested 상태 + RLS 조정 + 예약 함수
-- ============================================================

-- ------------------------------------------------------------
-- status에 'requested'(승인 대기) 추가 [BR-BK-02]
-- ------------------------------------------------------------
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check
  CHECK (status IN ('requested', 'pending', 'completed', 'cancelled'));

-- ------------------------------------------------------------
-- RLS 조정 [BR-RLS-10,11]
-- ------------------------------------------------------------

-- appointments: admin 전체 OR 고객 자기 회원 예약
DROP POLICY IF EXISTS "appointments admin only" ON appointments;
DROP POLICY IF EXISTS "appointments access" ON appointments;
CREATE POLICY "appointments access"
  ON appointments FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

-- treatment_types: admin 쓰기 + 모든 인증 사용자 읽기 (예약 시 시술 선택)
DROP POLICY IF EXISTS "treatment_types admin only" ON treatment_types;
DROP POLICY IF EXISTS "treatment_types admin write" ON treatment_types;
DROP POLICY IF EXISTS "treatment_types member read" ON treatment_types;
CREATE POLICY "treatment_types admin write"
  ON treatment_types FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "treatment_types member read"
  ON treatment_types FOR SELECT
  TO authenticated
  USING (true);

-- ------------------------------------------------------------
-- 가용성 조회 함수 [BR-AV-03] — 점유 시각만 반환 (타 회원 정보 비노출)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_taken_slots(p_from TIMESTAMPTZ, p_to TIMESTAMPTZ)
RETURNS TABLE(slot TIMESTAMPTZ)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT scheduled_at
  FROM appointments
  WHERE scheduled_at >= p_from
    AND scheduled_at < p_to
    AND status IN ('requested', 'pending', 'completed');
$$;

REVOKE ALL ON FUNCTION get_taken_slots(TIMESTAMPTZ, TIMESTAMPTZ) FROM public;
GRANT EXECUTE ON FUNCTION get_taken_slots(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

-- ------------------------------------------------------------
-- 예약 신청 함수 [BR-BK-01~06] — 충돌검사 + 생성 원자 처리
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION request_appointment(
  p_treatment_type_id UUID,
  p_scheduled_at TIMESTAMPTZ,
  p_memo TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_member_id UUID;
  v_appointment_id UUID;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED';
  END IF;

  -- 연결된 회원 확인 [BR-BK-01]
  SELECT id INTO v_member_id FROM members WHERE user_id = v_uid;
  IF v_member_id IS NULL THEN
    RAISE EXCEPTION 'NOT_MEMBER';
  END IF;

  -- 과거 시각 불가 [BR-BK-03]
  IF p_scheduled_at <= now() THEN
    RAISE EXCEPTION 'PAST_TIME';
  END IF;

  -- 12주(84일) 이내만 [BR-BK-04]
  IF p_scheduled_at > now() + INTERVAL '84 days' THEN
    RAISE EXCEPTION 'TOO_FAR';
  END IF;

  -- 슬롯 충돌 검사 [BR-BK-06]
  IF EXISTS (
    SELECT 1 FROM appointments
    WHERE scheduled_at = p_scheduled_at
      AND status IN ('requested', 'pending', 'completed')
  ) THEN
    RAISE EXCEPTION 'SLOT_TAKEN';
  END IF;

  -- 신청 생성 (승인 대기)
  INSERT INTO appointments (member_id, treatment_type_id, scheduled_at, status, memo)
  VALUES (v_member_id, p_treatment_type_id, p_scheduled_at, 'requested', p_memo)
  RETURNING id INTO v_appointment_id;

  RETURN v_appointment_id;
END;
$$;

REVOKE ALL ON FUNCTION request_appointment(UUID, TIMESTAMPTZ, TEXT) FROM public;
GRANT EXECUTE ON FUNCTION request_appointment(UUID, TIMESTAMPTZ, TEXT) TO authenticated;
