'use client'

import { useState } from 'react'
import { cancelAppointmentAction } from '@/app/(member)/me/appointments/actions'

export default function CancelAppointmentButton({
  id,
  canCancel,
}: {
  id: string
  canCancel: boolean
}) {
  const [pending, setPending] = useState(false)

  if (!canCancel) {
    return (
      <span className="text-xs text-gray-300">변경 불가 (24시간 이내)</span>
    )
  }

  async function handleCancel() {
    if (!confirm('예약을 취소하시겠습니까?')) return
    setPending(true)
    await cancelAppointmentAction(id)
  }

  return (
    <button
      onClick={handleCancel}
      disabled={pending}
      data-testid="member-cancel-appointment-button"
      className="text-xs text-red-600 hover:underline disabled:opacity-60"
    >
      {pending ? '취소 중...' : '취소'}
    </button>
  )
}
