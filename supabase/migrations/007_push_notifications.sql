-- ============================================================
-- Baddie Eye — 알림 (Bolt 6)
-- 웹푸시 구독 저장 + 리마인더 중복 방지
-- ============================================================

-- ------------------------------------------------------------
-- 푸시 구독 [BR-PS-03,05]
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL UNIQUE,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user
  ON push_subscriptions (user_id);

-- RLS: 자기 구독만 [BR-RLS-20]
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "push_sub owner" ON push_subscriptions;
CREATE POLICY "push_sub owner"
  ON push_subscriptions FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ------------------------------------------------------------
-- 리마인더 중복 방지 [BR-RM-02,03]
-- ------------------------------------------------------------
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;

-- 리마인더 대상 조회 성능 (status + scheduled_at)
CREATE INDEX IF NOT EXISTS idx_appointments_reminder
  ON appointments (scheduled_at)
  WHERE status = 'pending' AND reminder_sent_at IS NULL;
