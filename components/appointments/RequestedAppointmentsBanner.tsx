'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '@/components/ui/Modal'
import AppointmentStatusActions from './AppointmentStatusActions'
import { extractTime, extractKstDate } from '@/lib/booking/slots'
import { formatPhone } from '@/lib/format'

export interface RequestedItem {
  id: string
  scheduled_at: string
  member_name: string
  member_phone: string | null
  treatment_name: string
  memo: string | null
}

// 대시보드 "승인 대기" 배너 — 클릭 시 페이지 이동 대신 모달로 상세/승인/거절
export default function RequestedAppointmentsBanner({
  appointments,
}: {
  appointments: RequestedItem[]
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  if (appointments.length === 0) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="dashboard-requested-banner"
        className="block w-full rounded-lg bg-amber-50 p-4 text-left text-sm text-amber-800 hover:bg-amber-100"
      >
        ⏳ 승인 대기 중인 예약 신청이 <b>{appointments.length}건</b> 있습니다. →
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="승인 대기 예약">
        <ul className="space-y-4" data-testid="requested-modal-list">
          {appointments.map((a) => (
            <li key={a.id} className="rounded-lg border border-gray-100 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium text-gray-800">{a.member_name}</p>
                <span className="text-sm text-gray-500">
                  {extractKstDate(a.scheduled_at)} {extractTime(a.scheduled_at)}
                </span>
              </div>
              <dl className="mb-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-400">시술</dt>
                  <dd className="text-gray-700">{a.treatment_name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">연락처</dt>
                  <dd className="text-gray-700">
                    {a.member_phone ? formatPhone(a.member_phone) : '-'}
                  </dd>
                </div>
                {a.memo && (
                  <div className="flex justify-between gap-4">
                    <dt className="shrink-0 text-gray-400">메모</dt>
                    <dd className="whitespace-pre-wrap text-right text-gray-700">
                      {a.memo}
                    </dd>
                  </div>
                )}
              </dl>
              <AppointmentStatusActions
                id={a.id}
                status="requested"
                onDone={() => router.refresh()}
              />
            </li>
          ))}
        </ul>
      </Modal>
    </>
  )
}
