import { createClient } from '@/lib/supabase/server'
import type { Member, TreatmentType } from '@/types/database'
import {
  getWeekStart,
  getWeekDays,
  shiftWeek,
  combineDateTime,
} from '@/lib/booking/slots'
import { type CalendarAppointment } from '@/components/appointments/WeekCalendar'
import AppointmentsBoard from '@/components/appointments/AppointmentsBoard'

interface AppointmentsPageProps {
  searchParams: { week?: string }
}

interface AppointmentRow {
  id: string
  scheduled_at: string
  status: CalendarAppointment['status']
  member_id: string
  treatment_type_id: string
  memo: string | null
  members: { name: string } | null
  treatment_types: { name: string; duration_min: number } | null
}

export default async function AppointmentsPage({
  searchParams,
}: AppointmentsPageProps) {
  const weekStart = searchParams.week ?? getWeekStart(new Date())
  const days = getWeekDays(weekStart)
  // 주 범위: 월요일 00:00 ~ 다음 월요일 00:00 (KST)
  const rangeStart = combineDateTime(days[0], '00:00')
  const rangeEnd = combineDateTime(shiftWeek(weekStart, 1), '00:00')

  const supabase = createClient()
  const [{ data }, { data: memberData }, { data: treatmentData }] =
    await Promise.all([
      supabase
        .from('appointments')
        .select(
          'id, scheduled_at, status, member_id, treatment_type_id, memo, members(name), treatment_types(name, duration_min)',
        )
        .gte('scheduled_at', rangeStart)
        .lt('scheduled_at', rangeEnd),
      supabase
        .from('members')
        .select('id, name')
        .eq('is_active', true)
        .order('name'),
      supabase.from('treatment_types').select('id, name').order('name'),
    ])

  const rows = (data ?? []) as unknown as AppointmentRow[]
  const appointments: CalendarAppointment[] = rows.map((r) => ({
    id: r.id,
    scheduled_at: r.scheduled_at,
    status: r.status,
    member_name: r.members?.name ?? '(삭제된 회원)',
    treatment_name: r.treatment_types?.name ?? '(삭제된 시술)',
    duration_min: r.treatment_types?.duration_min ?? 30,
    member_id: r.member_id,
    treatment_type_id: r.treatment_type_id,
    memo: r.memo,
  }))

  const members = (memberData ?? []) as Pick<Member, 'id' | 'name'>[]
  const treatments = (treatmentData ?? []) as Pick<TreatmentType, 'id' | 'name'>[]

  return (
    <AppointmentsBoard
      weekStart={weekStart}
      days={days}
      appointments={appointments}
      members={members}
      treatments={treatments}
    />
  )
}
