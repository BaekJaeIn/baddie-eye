-- ============================================================
-- Baddie Eye — 회원(고객) 앱 제거
-- 고객용 PWA를 폐기하면서 회원 전용 DB 구성을 되돌린다.
--   - 회원 자기-데이터 접근 RLS → admin 전용으로 복원
--   - 회원 전용 SECURITY DEFINER 함수 제거
--
-- 유지하는 것 (관리자앱이 사용):
--   - members 테이블 + members.user_id 컬럼 (회원 관리, 알림 조회)
--   - push_subscriptions / is_owner (원장 푸시 알림)
--   - appointments.status 'requested' 값 (예약 승인 흐름 표시)
--
-- ⚠️ 멱등 실행을 위해 정책은 DROP IF EXISTS 후 재생성한다.
-- ============================================================

-- ------------------------------------------------------------
-- members: 고객 자기-접근 제거 → admin 전용
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "members access" ON members;
DROP POLICY IF EXISTS "members admin only" ON members;
CREATE POLICY "members admin only"
  ON members FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ------------------------------------------------------------
-- visit_history: 고객 자기-접근 제거 → admin 전용
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "visit_history access" ON visit_history;
DROP POLICY IF EXISTS "visit_history admin only" ON visit_history;
CREATE POLICY "visit_history admin only"
  ON visit_history FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ------------------------------------------------------------
-- appointments: 고객 자기-예약 접근 제거 → admin 전용
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "appointments access" ON appointments;
DROP POLICY IF EXISTS "appointments admin only" ON appointments;
CREATE POLICY "appointments admin only"
  ON appointments FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ------------------------------------------------------------
-- treatment_types: 고객 읽기 정책 제거 → admin 전용
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "treatment_types member read" ON treatment_types;
DROP POLICY IF EXISTS "treatment_types admin write" ON treatment_types;
DROP POLICY IF EXISTS "treatment_types admin only" ON treatment_types;
CREATE POLICY "treatment_types admin only"
  ON treatment_types FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ------------------------------------------------------------
-- 회원 전용 함수 제거 (온보딩/예약 신청/가용 슬롯 조회)
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS link_or_create_member(TEXT, TEXT);
DROP FUNCTION IF EXISTS request_appointment(UUID, TIMESTAMPTZ, TEXT);
DROP FUNCTION IF EXISTS get_taken_slots(TIMESTAMPTZ, TIMESTAMPTZ);
