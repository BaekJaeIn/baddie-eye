-- ============================================================
-- Baddie Eye — 초기 스키마 (Bolt 1)
-- 4개 테이블 + 인덱스 + Row Level Security
-- ============================================================

-- ------------------------------------------------------------
-- members: 회원 정보
-- ------------------------------------------------------------
CREATE TABLE members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  phone           TEXT NOT NULL UNIQUE,
  birthday        DATE,
  first_visit_at  DATE,
  allergy_note    TEXT,
  membership_tier TEXT NOT NULL DEFAULT 'regular'
                  CHECK (membership_tier IN ('regular', 'loyal', 'vip')),
  points          INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- [성능] 연락처 조회/중복 검사 (UNIQUE가 인덱스 생성하지만 명시)
CREATE INDEX idx_members_phone ON members (phone);

-- ------------------------------------------------------------
-- treatment_types: 시술 종류
-- ------------------------------------------------------------
CREATE TABLE treatment_types (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  duration_min  INTEGER NOT NULL CHECK (duration_min > 0),
  base_price    INTEGER NOT NULL CHECK (base_price >= 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- appointments: 예약
-- ------------------------------------------------------------
CREATE TABLE appointments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id         UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  treatment_type_id UUID NOT NULL REFERENCES treatment_types(id) ON DELETE RESTRICT,
  scheduled_at      TIMESTAMPTZ NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'completed', 'cancelled')),
  memo              TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- [성능] 회원별/날짜별 예약 조회 (Bolt 3 캘린더)
CREATE INDEX idx_appointments_member_id ON appointments (member_id);
CREATE INDEX idx_appointments_scheduled_at ON appointments (scheduled_at);

-- ------------------------------------------------------------
-- visit_history: 시술 내역
-- ------------------------------------------------------------
CREATE TABLE visit_history (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id              UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  appointment_id         UUID REFERENCES appointments(id) ON DELETE SET NULL,
  treatment_type_id      UUID NOT NULL REFERENCES treatment_types(id) ON DELETE RESTRICT,
  visited_at             TIMESTAMPTZ NOT NULL,
  price_paid             INTEGER NOT NULL CHECK (price_paid >= 0),
  before_after_photo_url TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- [성능] 회원별 시술 히스토리 (Bolt 4 마이페이지)
CREATE INDEX idx_visit_history_member_id ON visit_history (member_id);
CREATE INDEX idx_visit_history_visited_at ON visit_history (visited_at);

-- ============================================================
-- Row Level Security [SECURITY-06]
-- 모든 테이블 RLS 활성화. Bolt 1에서는 Admin(service_role)만 접근.
-- service_role 키는 RLS를 우회하므로 별도 정책 불필요.
-- authenticated/anon 역할은 정책이 없으면 기본 차단(deny-by-default).
-- Member(고객) 접근 정책은 Bolt 4에서 추가.
-- ============================================================
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_history ENABLE ROW LEVEL SECURITY;

-- 명시적 deny-by-default 확인용 주석:
-- RLS가 켜져 있고 정책이 없으면 anon/authenticated는 모든 행이 차단됨.
-- Admin 작업은 서버에서 service_role 키로 수행 (RLS 우회).
