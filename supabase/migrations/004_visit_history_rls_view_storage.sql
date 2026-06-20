-- ============================================================
-- Baddie Eye — 시술 내역 (Bolt 3.5)
-- visit_history RLS + member_last_visit 뷰 + Storage + 유니크
-- ============================================================

-- ------------------------------------------------------------
-- 중복 자동생성 방지 [BR-VH-05]
-- 동일 예약(appointment_id)당 시술 내역 1건
-- ------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS idx_visit_history_appointment
  ON visit_history (appointment_id)
  WHERE appointment_id IS NOT NULL;

-- ------------------------------------------------------------
-- RLS 정책 [SECURITY-06] — Bolt 2/3과 동일 패턴
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "authenticated admin full access on visit_history" ON visit_history;
CREATE POLICY "authenticated admin full access on visit_history"
  ON visit_history FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ------------------------------------------------------------
-- 회원별 마지막 시술 + 재방문 권장일 뷰 [BR-RC-01,02]
-- ------------------------------------------------------------
DROP VIEW IF EXISTS member_last_visit;
CREATE VIEW member_last_visit AS
SELECT DISTINCT ON (vh.member_id)
  vh.member_id,
  vh.visited_at,
  vh.treatment_type_id,
  tt.name AS treatment_name,
  tt.recommended_interval_days,
  CASE
    WHEN tt.recommended_interval_days IS NOT NULL
    THEN ((vh.visited_at AT TIME ZONE 'Asia/Seoul')::date
          + tt.recommended_interval_days)
    ELSE NULL
  END AS recommended_return_date
FROM visit_history vh
JOIN treatment_types tt ON tt.id = vh.treatment_type_id
ORDER BY vh.member_id, vh.visited_at DESC;

-- ------------------------------------------------------------
-- Storage 버킷 + 정책 [Q3=B, BR-IMG, BR-SEC-42]
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('visit-photos', 'visit-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "authenticated upload visit photos" ON storage.objects;
CREATE POLICY "authenticated upload visit photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'visit-photos');

DROP POLICY IF EXISTS "authenticated update visit photos" ON storage.objects;
CREATE POLICY "authenticated update visit photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'visit-photos');

DROP POLICY IF EXISTS "public read visit photos" ON storage.objects;
CREATE POLICY "public read visit photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'visit-photos');
