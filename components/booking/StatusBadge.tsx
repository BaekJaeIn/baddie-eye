import { STATUS_LABEL, STATUS_STYLE } from '@/lib/booking/status'
import type { AppointmentStatus } from '@/types/database'

export default function StatusBadge({
  status,
}: {
  status: AppointmentStatus
}) {
  return (
    <span
      data-testid="appointment-status-badge"
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}
