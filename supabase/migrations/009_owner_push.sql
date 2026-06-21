-- ============================================================
-- Baddie Eye — 원장(owner) 푸시 대상 구분
-- 예약 신청 시 원장 알림 / 예약 확정 시 회원 알림을 위해
-- 구독이 "원장용"인지 표시한다. (회원 구독은 false)
-- ============================================================

ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS is_owner BOOLEAN NOT NULL DEFAULT false;

-- 원장 구독 빠른 조회 (예약 신청 알림 발송 시)
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_owner
  ON push_subscriptions (is_owner)
  WHERE is_owner = true;
