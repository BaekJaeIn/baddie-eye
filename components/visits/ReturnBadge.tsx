import { getReturnInfo, formatDday } from '@/lib/visit/recommend'

interface ReturnBadgeProps {
  recommendedReturnDate: string | null
  // later(여유) 상태도 표시할지 (상세 페이지=true, 목록=false)
  showLater?: boolean
}

export default function ReturnBadge({
  recommendedReturnDate,
  showLater = false,
}: ReturnBadgeProps) {
  const { status, dday } = getReturnInfo(recommendedReturnDate)

  if (status === 'none') return null
  if (status === 'later' && !showLater) return null

  const styles: Record<string, string> = {
    overdue: 'bg-red-100 text-red-700',
    soon: 'bg-orange-100 text-orange-700',
    later: 'bg-gray-100 text-gray-500',
  }

  return (
    <span
      data-testid="return-badge"
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      재방문 {dday !== null ? formatDday(dday) : ''}
    </span>
  )
}
