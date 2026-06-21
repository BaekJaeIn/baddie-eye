import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { AppointmentStatus } from '@/types/database'
import { extractTime, extractKstDate } from '@/lib/booking/slots'
import StatusBadge from '@/components/booking/StatusBadge'
import CancelAppointmentButton from '@/components/booking/CancelAppointmentButton'
import BackToMain from '@/components/member/BackToMain'

interface ApptRow {
  id: string
  scheduled_at: string
  status: AppointmentStatus
  treatment_types: { name: string } | null
}

function canModify(scheduledAt: string, status: AppointmentStatus): boolean {
  if (status !== 'requested' && status !== 'pending') return false
  return new Date(scheduledAt).getTime() - Date.now() >= 24 * 60 * 60 * 1000
}

export default async function MyAppointmentsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('members')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!member) redirect('/onboarding')

  const { data } = await supabase
    .from('appointments')
    .select('id, scheduled_at, status, treatment_types(name)')
    .order('scheduled_at', { ascending: false })

  const appts = (data ?? []) as unknown as ApptRow[]

  return (
    <div className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <BackToMain />
        <Link
          href="/booking"
          data-testid="new-booking-link"
          className="rounded-md bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-dark"
        >
          + 예약하기
        </Link>
      </div>
      <h1 className="mb-6 text-xl font-bold text-gray-800">내 예약</h1>

      {appts.length === 0 ? (
        <p
          data-testid="my-appointments-empty"
          className="py-10 text-center text-sm text-gray-400"
        >
          예약 내역이 없습니다.
        </p>
      ) : (
        <ul className="space-y-3" data-testid="my-appointments-list">
          {appts.map((a) => {
            const modifiable = canModify(a.scheduled_at, a.status)
            return (
              <li
                key={a.id}
                className="rounded-lg border border-gray-100 p-4"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium text-gray-800">
                    {a.treatment_types?.name ?? '-'}
                  </span>
                  <StatusBadge status={a.status} />
                </div>
                <p className="text-sm text-gray-500">
                  {extractKstDate(a.scheduled_at)} {extractTime(a.scheduled_at)}
                </p>
                {(a.status === 'requested' || a.status === 'pending') && (
                  <div className="mt-2 flex items-center gap-3">
                    {modifiable ? (
                      <>
                        <Link
                          href={`/me/appointments/${a.id}/edit`}
                          className="text-xs text-gray-500 hover:underline"
                        >
                          변경
                        </Link>
                        <CancelAppointmentButton id={a.id} canCancel />
                      </>
                    ) : (
                      <CancelAppointmentButton id={a.id} canCancel={false} />
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
