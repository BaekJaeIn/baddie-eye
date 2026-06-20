-- ============================================================
-- Baddie Eye — 소요시간 기반 예약 충돌/가용성 (Bolt 8)
-- 예약이 시술 소요시간만큼 슬롯을 점유하도록 함수 강화
-- ============================================================

-- ------------------------------------------------------------
-- 가용성: 예약이 차지하는 모든 30분 슬롯을 반환
-- (90분 예약이면 시작/+30/+60 세 슬롯 모두 점유로 노출)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_taken_slots(p_from TIMESTAMPTZ, p_to TIMESTAMPTZ)
RETURNS TABLE(slot TIMESTAMPTZ)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT gs AS slot
  FROM appointments a
  JOIN treatment_types t ON t.id = a.treatment_type_id
  CROSS JOIN LATERAL generate_series(
    a.scheduled_at,
    a.scheduled_at + make_interval(mins => GREATEST(t.duration_min, 1)) - interval '1 minute',
    interval '30 minutes'
  ) AS gs
  WHERE a.status IN ('requested', 'pending', 'completed')
    AND a.scheduled_at < p_to
    AND a.scheduled_at + make_interval(mins => GREATEST(t.duration_min, 1)) > p_from;
$$;

REVOKE ALL ON FUNCTION get_taken_slots(TIMESTAMPTZ, TIMESTAMPTZ) FROM public;
GRANT EXECUTE ON FUNCTION get_taken_slots(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

-- ------------------------------------------------------------
-- 예약 신청: 충돌 검사를 소요시간 범위 겹침으로 [BR-BK-06 강화]
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
  v_dur INTEGER;
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

  -- 신청 시술의 소요시간
  SELECT GREATEST(duration_min, 1) INTO v_dur
  FROM treatment_types WHERE id = p_treatment_type_id;
  IF v_dur IS NULL THEN
    v_dur := 30;
  END IF;

  -- 시간대 겹침 검사 [BR-BK-06] — 새 예약 [start, start+dur)이
  -- 기존 예약 [s, s+dur)과 겹치면 차단
  IF EXISTS (
    SELECT 1
    FROM appointments a
    JOIN treatment_types t ON t.id = a.treatment_type_id
    WHERE a.status IN ('requested', 'pending', 'completed')
      AND a.scheduled_at < p_scheduled_at + make_interval(mins => v_dur)
      AND a.scheduled_at + make_interval(mins => GREATEST(t.duration_min, 1)) > p_scheduled_at
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
