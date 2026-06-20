'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  updateAppointmentStatusAction,
  approveAppointmentAction,
  rejectAppointmentAction,
} from '@/app/admin/(protected)/appointments/actions'
import type { AppointmentStatus } from '@/types/database'

interface Props {
  id: string
  status: AppointmentStatus
  // 액션 완료 후 콜백. 없으면 router.refresh()
  onDone?: () => void
  // '변경' 처리. 있으면 버튼(모달 내 전환), 없으면 수정 페이지 링크
  onEdit?: () => void
}

export default function AppointmentStatusActions({
  id,
  status,
  onDone,
  onEdit,
}: Props) {
  const [pending, setPending] = useState(false)
  const router = useRouter()

  const done = () => {
    if (onDone) onDone()
    else router.refresh()
  }

  // 승인 대기(requested): 승인 / 거절
  if (status === 'requested') {
    return (
      <div className="flex gap-2">
        <button
          onClick={async () => {
            setPending(true)
            await approveAppointmentAction(id)
            done()
          }}
          disabled={pending}
          data-testid="appointment-approve-button"
          className="rounded-md bg-brand px-4 py-2 text-sm text-white hover:bg-brand-dark disabled:opacity-60"
        >
          승인
        </button>
        <button
          onClick={async () => {
            if (!confirm('이 예약 신청을 거절하시겠습니까?')) return
            setPending(true)
            await rejectAppointmentAction(id)
            done()
          }}
          disabled={pending}
          data-testid="appointment-reject-button"
          className="rounded-md border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          거절
        </button>
      </div>
    )
  }

  // 확정(pending): 완료 / 변경 / 취소
  if (status === 'pending') {
    return (
      <div className="flex gap-2">
        <button
          onClick={async () => {
            setPending(true)
            await updateAppointmentStatusAction(id, 'completed')
            done()
          }}
          disabled={pending}
          data-testid="appointment-complete-button"
          className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-60"
        >
          완료 처리
        </button>
        {onEdit ? (
          <button
            onClick={onEdit}
            data-testid="appointment-edit-button"
            className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            변경
          </button>
        ) : (
          <Link
            href={`/admin/appointments/${id}/edit`}
            data-testid="appointment-edit-link"
            className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            변경
          </Link>
        )}
        <button
          onClick={async () => {
            if (!confirm('이 예약을 취소하시겠습니까?')) return
            setPending(true)
            await updateAppointmentStatusAction(id, 'cancelled')
            done()
          }}
          disabled={pending}
          data-testid="appointment-cancel-button"
          className="rounded-md border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          취소
        </button>
      </div>
    )
  }

  return null
}
