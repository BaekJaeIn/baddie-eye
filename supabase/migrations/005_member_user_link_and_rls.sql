-- ============================================================
-- Baddie Eye — 고객 연동 (Bolt 4)
-- members.user_id 연결 + RLS admin-or-owner 재설계
-- ============================================================

-- ------------------------------------------------------------
-- 회원 ↔ auth.users 연결 [BR-MB-04]
-- ------------------------------------------------------------
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_members_user_id ON members (user_id);

-- ------------------------------------------------------------
-- RLS 재설계 [BR-RLS-01~04, SECURITY-06/08]
-- 고객도 authenticated가 되므로 "전체 접근"을 admin-or-owner로 교체.
-- Admin 식별: app_metadata.role = 'admin'
-- 고객: 자기 user_id 데이터만
--
-- ⚠️ Admin 계정에 role 부여 필요 (setup):
--   UPDATE auth.users SET raw_app_meta_data =
--     raw_app_meta_data || '{"role":"admin"}'::jsonb
--   WHERE email = 'admin@example.com';
-- ------------------------------------------------------------

-- members
DROP POLICY IF EXISTS "authenticated admin full access on members" ON members;
DROP POLICY IF EXISTS "members access" ON members;
CREATE POLICY "members access"
  ON members FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR user_id = auth.uid()
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR user_id = auth.uid()
  );

-- visit_history (고객은 자기 회원의 내역만)
DROP POLICY IF EXISTS "authenticated admin full access on visit_history" ON visit_history;
DROP POLICY IF EXISTS "visit_history access" ON visit_history;
CREATE POLICY "visit_history access"
  ON visit_history FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

-- treatment_types / appointments: 고객 직접 접근 불필요 → Admin 전용 유지.
-- 기존 "authenticated admin full access" 정책을 admin-only로 좁힘.
DROP POLICY IF EXISTS "authenticated admin full access on treatment_types" ON treatment_types;
DROP POLICY IF EXISTS "treatment_types admin only" ON treatment_types;
CREATE POLICY "treatment_types admin only"
  ON treatment_types FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "authenticated admin full access on appointments" ON appointments;
DROP POLICY IF EXISTS "appointments admin only" ON appointments;
CREATE POLICY "appointments admin only"
  ON appointments FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ------------------------------------------------------------
-- 회원 연결 함수 [BR-MB-04~06]
-- 온보딩에서 user_id IS NULL인 기존 회원은 admin-or-owner RLS로
-- 고객이 접근 불가하므로, SECURITY DEFINER 함수로 안전하게 연결/생성.
-- 호출자는 auth.uid()로 식별 (서버 Server Action에서 호출).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION link_or_create_member(p_phone TEXT, p_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_member_id UUID;
  v_existing_user UUID;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED';
  END IF;

  -- 이미 이 사용자에 연결된 회원이 있으면 그대로 반환
  SELECT id INTO v_member_id FROM members WHERE user_id = v_uid;
  IF v_member_id IS NOT NULL THEN
    RETURN v_member_id;
  END IF;

  -- 전화번호로 기존(미연결) 회원 탐색
  SELECT id, user_id INTO v_member_id, v_existing_user
  FROM members WHERE phone = p_phone;

  IF v_member_id IS NOT NULL THEN
    IF v_existing_user IS NOT NULL THEN
      RAISE EXCEPTION 'PHONE_ALREADY_LINKED'; -- [BR-MB-06]
    END IF;
    UPDATE members SET user_id = v_uid WHERE id = v_member_id; -- [BR-MB-04]
    RETURN v_member_id;
  END IF;

  -- 없으면 신규 생성 [BR-MB-05]
  INSERT INTO members (name, phone, user_id)
  VALUES (p_name, p_phone, v_uid)
  RETURNING id INTO v_member_id;
  RETURN v_member_id;
END;
$$;

REVOKE ALL ON FUNCTION link_or_create_member(TEXT, TEXT) FROM public;
GRANT EXECUTE ON FUNCTION link_or_create_member(TEXT, TEXT) TO authenticated;
