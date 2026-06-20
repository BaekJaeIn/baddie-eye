import Image from 'next/image'

export interface MyVisitItem {
  id: string
  visited_at: string
  treatment_name: string
  before_after_photo_url: string | null
}

// 고객용 시술 히스토리 — 읽기 전용 (편집 링크 없음)
export default function MyVisitHistory({ visits }: { visits: MyVisitItem[] }) {
  if (visits.length === 0) {
    return (
      <p
        className="py-6 text-center text-sm text-gray-400"
        data-testid="my-visit-empty"
      >
        아직 시술 내역이 없습니다.
      </p>
    )
  }

  return (
    <ul className="space-y-3" data-testid="my-visit-list">
      {visits.map((v) => (
        <li
          key={v.id}
          className="flex items-center gap-3 rounded-lg border border-gray-100 p-3"
        >
          {v.before_after_photo_url ? (
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
              <Image
                src={v.before_after_photo_url}
                alt={v.treatment_name}
                fill
                sizes="56px"
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-gray-50 text-xs text-gray-300">
              사진
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-800">
              {v.treatment_name}
            </p>
            <p className="text-xs text-gray-400">{v.visited_at.slice(0, 10)}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
