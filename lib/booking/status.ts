import type { AppointmentStatus } from '@/types/database'

// 예약 상태 라벨/색상 (Admin·고객 공용)
export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  requested: '승인대기',
  pending: '확정',
  completed: '완료',
  cancelled: '취소',
}

// Tailwind 배경/글자 색상 클래스
export const STATUS_STYLE: Record<AppointmentStatus, string> = {
  requested: 'bg-amber-100 text-amber-700',
  pending: 'bg-brand-light/20 text-brand-dark',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

// 캘린더 셀 색상 (취소는 취소선). 완료는 초록 계열로 명확히.
export const STATUS_CALENDAR_STYLE: Record<AppointmentStatus, string> = {
  requested: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
  pending: 'bg-brand-light/20 text-brand-dark hover:bg-brand-light/30',
  completed: 'bg-green-200 text-green-800 hover:bg-green-300',
  cancelled: 'bg-gray-100 text-gray-400 line-through',
}
