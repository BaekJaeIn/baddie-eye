-- ============================================================
-- Baddie Eye — 태블릿 동의서 (Consent)
-- 매장 태블릿에서 회원이 규약(이용/개인정보)에 동의한 기록을 저장한다.
-- 태블릿은 관리자(원장)가 운영하며, 등록된 회원을 선택해 동의를 받는다.
-- ============================================================

CREATE TABLE IF NOT EXISTS consents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  terms_version TEXT NOT NULL,
  agreed        BOOLEAN NOT NULL,
  agreed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 회원별 최신 동의 조회용
CREATE INDEX IF NOT EXISTS idx_consents_member
  ON consents (member_id, agreed_at DESC);

-- RLS: 관리자(원장) 전용 — 태블릿은 관리자 세션으로 동작한다.
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "consents admin only" ON consents;
CREATE POLICY "consents admin only"
  ON consents FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
