import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Appointment, TreatmentType } from '@/types/database'
import { extractTime, extractKstDate } from '@/lib/booking/slots'
import BookingForm from '@/components/booking/BookingForm'
import { updateMemberAppointmentAction } from '../../actions'

interface EditPageProps {
  params: { id: string }
}

function canModify(scheduledAt: string, status: string): boolean {
  if (status !== 'requested' && status !== 'pending') return false
  return new Date(scheduledAt).getTime() - Date.now() >= 24 * 60 * 60 * 1000
}

export default async function EditMemberAppointmentPage({
  params,
}: EditPageProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // RLS로 자기 예약만 조회됨
  const { data } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', params.id)
    .single()
  if (!data) notFound()
  const appt = data as Appointment

  // 변경 불가 → 목록으로
  if (!canModify(appt.scheduled_at, appt.status)) {
    redirect('/me/appointments')
  }

  const { data: treatmentData } = await supabase
    .from('treatment_types')
    .select('id, name, duration_min, base_price')
    .order('name')
  const treatments = (treatmentData ?? []) as Pick<
    TreatmentType,
    'id' | 'name' | 'duration_min' | 'base_price'
  >[]

  const action = updateMemberAppointmentAction.bind(null, appt.id)

  return (
    <div className="p-5">
      <div className="mb-4">
        <Link
          href="/me/appointments"
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ← 내 예약
        </Link>
      </div>
      <h1 className="mb-6 text-xl font-bold text-gray-800">예약 변경</h1>
      <BookingForm
        treatments={treatments}
        action={action}
        submitLabel="변경 저장"
        defaults={{
          treatment_type_id: appt.treatment_type_id,
          date: extractKstDate(appt.scheduled_at),
          time: extractTime(appt.scheduled_at),
          memo: appt.memo,
        }}
      />
    </div>
  )
}
