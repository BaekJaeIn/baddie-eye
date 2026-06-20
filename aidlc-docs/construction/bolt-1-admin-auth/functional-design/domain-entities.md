# Domain Entities — bolt-1-admin-auth

---

## AdminSession (Supabase Auth 관리)

| 필드 | 타입 | 설명 |
|------|------|------|
| `userId` | `string` (UUID) | auth.users PK |
| `email` | `string` | 관리자 이메일 |
| `expiresAt` | `number` (Unix timestamp) | 세션 만료 시간 |
| `accessToken` | `string` | JWT (Supabase 관리) |
| `refreshToken` | `string` | 리프레시 토큰 (Supabase 관리) |

> Admin 계정은 Supabase 대시보드에서 직접 생성. 앱에 계정 생성 UI 없음.

---

## Member

```sql
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
```

---

## TreatmentType

```sql
CREATE TABLE treatment_types (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  duration_min  INTEGER NOT NULL CHECK (duration_min > 0),
  base_price    INTEGER NOT NULL CHECK (base_price >= 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## Appointment

```sql
CREATE TABLE appointments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id           UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  treatment_type_id   UUID NOT NULL REFERENCES treatment_types(id) ON DELETE RESTRICT,
  scheduled_at        TIMESTAMPTZ NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'completed', 'cancelled')),
  memo                TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## VisitHistory

```sql
CREATE TABLE visit_history (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id             UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  appointment_id        UUID REFERENCES appointments(id) ON DELETE SET NULL,
  treatment_type_id     UUID NOT NULL REFERENCES treatment_types(id) ON DELETE RESTRICT,
  visited_at            TIMESTAMPTZ NOT NULL,
  price_paid            INTEGER NOT NULL CHECK (price_paid >= 0),
  before_after_photo_url TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 관계 다이어그램

```
auth.users (Supabase 관리)
  (Admin 계정 단일)

members ──────────── appointments
  |                       |
  |                       +──── treatment_types
  |
  +──── visit_history ─── appointments (nullable)
              |
              +──────────── treatment_types
```

---

## TypeScript 타입 정의 (`types/database.ts`)

Supabase CLI로 자동 생성 예정:
```bash
pnpm supabase gen types typescript --project-id [project-ref] > types/database.ts
```

수동 기본 타입:
```typescript
export type MembershipTier = 'regular' | 'loyal' | 'vip'
export type AppointmentStatus = 'pending' | 'completed' | 'cancelled'

export interface Member {
  id: string
  name: string
  phone: string
  birthday: string | null
  first_visit_at: string | null
  allergy_note: string | null
  membership_tier: MembershipTier
  points: number
  created_at: string
}

export interface TreatmentType {
  id: string
  name: string
  duration_min: number
  base_price: number
  created_at: string
}

export interface Appointment {
  id: string
  member_id: string
  treatment_type_id: string
  scheduled_at: string
  status: AppointmentStatus
  memo: string | null
  created_at: string
}

export interface VisitHistory {
  id: string
  member_id: string
  appointment_id: string | null
  treatment_type_id: string
  visited_at: string
  price_paid: number
  before_after_photo_url: string | null
  created_at: string
}
```
