import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPhone } from '@/lib/format'
import Pagination from '@/components/members/Pagination'

const PAGE_SIZE = 20

interface VisitsPageProps {
  searchParams: { page?: string }
}

interface VisitRow {
  id: string
  visited_at: string
  price_paid: number
  member_id: string
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
    .select(
      'id, visited_at, price_paid, member_id, members(name, phone), treatment_types(name)',
      { count: 'exact' },
    )
    .order('visited_at', { ascending: false })
    .range(from, to)

  const visits = (data ?? []) as unknown as VisitRow[]
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
        <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
          <table className="w-full text-sm" data-testid="visit-table">
            <thead className="border-b border-gray-100 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">방문일</th>
                <th className="px-4 py-3">회원</th>
                <th className="px-4 py-3">시술</th>
                <th className="px-4 py-3">결제금액</th>
                <th className="px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((v) => (
                <tr key={v.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 text-gray-600">
                    {v.visited_at.slice(0, 10)}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {v.members ? (
                      <Link
                        href={`/admin/members/${v.member_id}`}
                        className="hover:underline"
                      >
                        {v.members.name}
                      </Link>
                    ) : (
                      '(삭제된 회원)'
                    )}
                    {v.members && (
                      <span className="ml-2 text-xs text-gray-400">
                        {formatPhone(v.members.phone)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {v.treatment_types?.name ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {v.price_paid.toLocaleString()}원
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/visits/${v.id}/edit`}
                      className="text-sm text-gray-500 hover:underline"
                    >
                      편집
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/admin/visits"
      />
    </div>
  )
}
