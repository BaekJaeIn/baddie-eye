import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Member, TreatmentType } from '@/types/database'
import AppointmentForm from '@/components/appointments/AppointmentForm'
import { createAppointmentAction } from '../actions'

interface NewAppointmentPageProps {
  searchParams: { date?: string; time?: string }
}

export default async function NewAppointmentPage({
  searchParams,
}: NewAppointmentPageProps) {
  const supabase = createClient()
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

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/appointments"
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ← 예약 관리
        </Link>
      </div>
      <h2 className="mb-6 text-xl font-semibold text-gray-800">예약 등록</h2>

      {members.length === 0 || treatments.length === 0 ? (
        <p className="text-sm text-gray-500">
          예약을 등록하려면 먼저{' '}
          {members.length === 0 && (
            <Link href="/admin/members/new" className="text-brand underline">
              회원
            </Link>
          )}
          {members.length === 0 && treatments.length === 0 && '과 '}
          {treatments.length === 0 && (
            <Link href="/admin/treatments/new" className="text-brand underline">
              시술 종류
            </Link>
          )}
          를 등록해주세요.
        </p>
      ) : (
        <AppointmentForm
          action={createAppointmentAction}
          members={members}
          treatments={treatments}
          defaults={{ date: searchParams.date, time: searchParams.time }}
        />
      )}
    </div>
  )
}
