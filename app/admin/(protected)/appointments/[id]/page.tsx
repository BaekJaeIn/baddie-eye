import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { AppointmentStatus } from '@/types/database'
import { formatPhone } from '@/lib/format'
import { extractTime, extractKstDate } from '@/lib/booking/slots'
import { STATUS_LABEL, STATUS_STYLE } from '@/lib/booking/status'
import AppointmentStatusActions from '@/components/appointments/AppointmentStatusActions'

interface AppointmentDetailPageProps {
  params: { id: string }
}

interface AppointmentDetail {
  id: string
  scheduled_at: string
  status: AppointmentStatus
  memo: string | null
  members: { id: string; name: string; phone: string } | null
  treatment_types: { name: string; duration_min: number; base_price: number } | null
}

export default async function AppointmentDetailPage({
  params,
}: AppointmentDetailPageProps) {
  const supabase = createClient()
  const { data } = await supabase
    .from('appointments')
    .select(
      'id, scheduled_at, status, memo, members(id, name, phone), treatment_types(name, duration_min, base_price)',
    )
    .eq('id', params.id)
    .single()

  if (!data) notFound()
  const apt = data as unknown as AppointmentDetail

  const date = extractKstDate(apt.scheduled_at)
  const time = extractTime(apt.scheduled_at)

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/admin/appointments"
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ← 예약 관리
        </Link>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">예약 상세</h2>
          <span
            data-testid="appointment-status"
            className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_STYLE[apt.status]}`}
          >
            {STATUS_LABEL[apt.status]}
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs text-gray-400">회원</dt>
            <dd className="text-gray-800">
              {apt.members ? (
                <Link
                  href={`/admin/members/${apt.members.id}`}
                  className="text-brand hover:underline"
                >
                  {apt.members.name}
                </Link>
              ) : (
                '(삭제된 회원)'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">연락처</dt>
            <dd className="text-gray-800">
              {apt.members ? formatPhone(apt.members.phone) : '-'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">시술</dt>
            <dd className="text-gray-800">
              {apt.treatment_types?.name ?? '(삭제된 시술)'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">가격</dt>
            <dd className="text-gray-800">
              {apt.treatment_types
                ? `${apt.treatment_types.base_price.toLocaleString()}원`
                : '-'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">일시</dt>
            <dd className="text-gray-800">
              {date} {time}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">메모</dt>
            <dd className="text-gray-800">{apt.memo ?? '-'}</dd>
          </div>
        </dl>

        {(apt.status === 'requested' || apt.status === 'pending') && (
          <div className="mt-6 border-t border-gray-100 pt-4">
            <AppointmentStatusActions id={apt.id} status={apt.status} />
          </div>
        )}
      </div>
    </div>
  )
}
