import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Appointment, Member, TreatmentType } from '@/types/database'
import { extractTime, extractKstDate } from '@/lib/booking/slots'
import AppointmentForm from '@/components/appointments/AppointmentForm'
import { updateAppointmentAction } from '../../actions'

interface EditAppointmentPageProps {
  params: { id: string }
}

export default async function EditAppointmentPage({
  params,
}: EditAppointmentPageProps) {
  const supabase = createClient()
  const { data } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!data) notFound()
  const appointment = data as Appointment

  // [BR-APT-07] pending 상태만 변경 가능
  if (appointment.status !== 'pending') {
    redirect(`/admin/appointments/${appointment.id}`)
  }

  const [{ data: memberData }, { data: treatmentData }] = await Promise.all([
    supabase
      .from('members')
      .select('id, name')
      .eq('is_active', true)
      .order('name'),
    supabase.from('treatment_types').select('id, name').order('name'),
  ])

  const members = (memberData ?? []) as Pick<Member, 'id' | 'name'>[]
  const treatments = (treatmentData ?? []) as Pick<TreatmentType, 'id' | 'name'>[]
  const action = updateAppointmentAction.bind(null, appointment.id)

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/admin/appointments/${appointment.id}`}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ← 예약 상세
        </Link>
      </div>
      <h2 className="mb-6 text-xl font-semibold text-gray-800">예약 변경</h2>
      <AppointmentForm
        action={action}
        members={members}
        treatments={treatments}
        defaults={{
          member_id: appointment.member_id,
          treatment_type_id: appointment.treatment_type_id,
          date: extractKstDate(appointment.scheduled_at),
          time: extractTime(appointment.scheduled_at),
          memo: appointment.memo,
        }}
      />
    </div>
  )
}
