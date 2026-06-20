-- ============================================================
-- Baddie Eye — 회원 관리 (Bolt 2)
-- 소프트 삭제 지원 + members RLS 정책
-- ============================================================

-- ------------------------------------------------------------
-- 소프트 삭제: is_active 플래그 [BR-MEM-11]
-- ------------------------------------------------------------
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- 활성 회원 목록 조회 성능
CREATE INDEX IF NOT EXISTS idx_members_is_active ON members (is_active);

-- 이름 검색 성능
CREATE INDEX IF NOT EXISTS idx_members_name ON members (name);

-- ------------------------------------------------------------
-- RLS 정책 [SECURITY-06]
-- Bolt 1에서 RLS는 켰지만 정책이 없어 anon/authenticated는 전체 차단됐음.
-- Bolt 2: 인증된 Admin(authenticated)이 anon 키로 members에 접근하도록 허용.
-- 주의: Bolt 4(고객 로그인) 추가 시 이 정책을 세분화해야 함.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "authenticated admin full access on members" ON members;

CREATE POLICY "authenticated admin full access on members"
  ON members FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
