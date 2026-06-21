import { createClient } from '@/lib/supabase/server'
import Pagination from '@/components/members/Pagination'
import VisitsBoard, {
  type VisitBoardItem,
} from '@/components/visits/VisitsBoard'

const PAGE_SIZE = 20

interface VisitsPageProps {
  searchParams: { page?: string }
}

interface VisitRow {
  id: string
  member_id: string
  appointment_id: string | null
  treatment_type_id: string
  visited_at: string
  price_paid: number
  before_after_photo_url: string | null
  created_at: string
  members: { name: string; phone: string } | null
  treatment_types: { name: string } | null
}

export default async function VisitsPage({ searchParams }: VisitsPageProps) {
  const page = Math.max(1, Number(searchParams.page) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = createClient()
  const { data, count } = await supabase
    .from('visit_history')
    .select('*, members(name, phone), treatment_types(name)', {
      count: 'exact',
    })
    .order('visited_at', { ascending: false })
    .range(from, to)

  const rows = (data ?? []) as unknown as VisitRow[]
  const visits: VisitBoardItem[] = rows.map((v) => ({
    id: v.id,
    member_id: v.member_id,
    appointment_id: v.appointment_id,
    treatment_type_id: v.treatment_type_id,
    visited_at: v.visited_at,
    price_paid: v.price_paid,
    before_after_photo_url: v.before_after_photo_url,
    created_at: v.created_at,
    member_name: v.members?.name ?? null,
    member_phone: v.members?.phone ?? null,
    treatment_name: v.treatment_types?.name ?? '-',
  }))
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE))

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-gray-800">시술 내역</h2>
      <p className="mb-4 text-sm text-gray-500">총 {count ?? 0}건</p>

      {visits.length === 0 ? (
        <p data-testid="visit-empty" className="py-12 text-center text-gray-400">
          시술 내역이 없습니다. 예약을 완료 처리하면 자동으로 기록됩니다.
        </p>
      ) : (
        <VisitsBoard visits={visits} />
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/admin/visits"
      />
    </div>
  )
}
