// DB 도메인 타입 — Bolt 1
// 향후 Supabase CLI로 자동 생성 가능:
//   pnpm supabase gen types typescript --project-id <ref> > types/database.ts

export type MembershipTier = 'regular' | 'loyal' | 'vip'
export type AppointmentStatus =
  | 'requested'
  | 'pending'
  | 'completed'
  | 'cancelled'

export interface Member {
  id: string
  name: string
  phone: string
  birthday: string | null
  first_visit_at: string | null
  allergy_note: string | null
  membership_tier: MembershipTier
  points: number
  is_active: boolean
  user_id: string | null
  created_at: string
}

export interface TreatmentType {
  id: string
  name: string
  duration_min: number
  base_price: number
  recommended_interval_days: number | null
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

// member_last_visit 뷰 (Bolt 3.5)
export interface MemberLastVisit {
  member_id: string
  visited_at: string
  treatment_type_id: string
  treatment_name: string
  recommended_interval_days: number | null
  recommended_return_date: string | null
}
