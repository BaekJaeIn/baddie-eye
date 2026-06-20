-- ============================================================
-- Baddie Eye — 예약/시술 관리 (Bolt 3)
-- 시술 종류 권장주기 + treatment_types/appointments RLS
-- ============================================================

-- ------------------------------------------------------------
-- 시술 종류별 권장 재방문 주기 (일) [Q4, BR-TRT-04]
-- NULL 허용 (미설정 가능)
-- ------------------------------------------------------------
ALTER TABLE treatment_types
  ADD COLUMN IF NOT EXISTS recommended_interval_days INTEGER
  CHECK (recommended_interval_days IS NULL OR recommended_interval_days > 0);

-- ------------------------------------------------------------
-- RLS 정책 [SECURITY-06] — Bolt 2 members와 동일 패턴.
-- 인증된 Admin(authenticated)이 anon 키로 접근하도록 허용.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "authenticated admin full access on treatment_types" ON treatment_types;
CREATE POLICY "authenticated admin full access on treatment_types"
  ON treatment_types FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated admin full access on appointments" ON appointments;
CREATE POLICY "authenticated admin full access on appointments"
  ON appointments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
