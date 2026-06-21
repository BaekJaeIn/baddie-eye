import Link from 'next/link'

export interface VisitListItem {
  id: string
  visited_at: string
  price_paid: number
  before_after_photo_url: string | null
  treatment_name: string
}

export default function VisitHistoryList({
  visits,
  onEdit,
}: {
  visits: VisitListItem[]
  // 모달에서 편집 시 콜백. 없으면 편집 페이지로 이동(링크).
  onEdit?: (id: string) => void
}) {
  if (visits.length === 0) {
    return (
      <p className="text-sm text-gray-400" data-testid="visit-history-empty">
        시술 내역이 없습니다.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-gray-100" data-testid="visit-history-list">
      {visits.map((v) => (
        <li key={v.id} className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm text-gray-800">{v.treatment_name}</p>
            <p className="text-xs text-gray-400">
              {v.visited_at.slice(0, 10)} · {v.price_paid.toLocaleString()}원
              {v.before_after_photo_url && ' · 📷'}
            </p>
          </div>
          {onEdit ? (
            <button
              type="button"
              onClick={() => onEdit(v.id)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              편집
            </button>
          ) : (
            <Link
              href={`/admin/visits/${v.id}/edit`}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              편집
            </Link>
          )}
        </li>
      ))}
    </ul>
  )
}
