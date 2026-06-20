import { createClient } from '@/lib/supabase/server'
import type { Member } from '@/types/database'
import MembersBoard from '@/components/members/MembersBoard'
import MemberSearchBar from '@/components/members/MemberSearchBar'
import MemberCreateButton from '@/components/members/MemberCreateButton'
import Pagination from '@/components/members/Pagination'

const PAGE_SIZE = 20

interface MembersPageProps {
  searchParams: { q?: string; tier?: string; page?: string }
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const q = searchParams.q?.trim() ?? ''
  const tier = searchParams.tier ?? ''
  const page = Math.max(1, Number(searchParams.page) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = createClient()
  let query = supabase
    .from('members')
    .select('*', { count: 'exact' })
    .eq('is_active', true)

  // [BR-MEM-12] 이름 또는 전화번호 부분 일치
  if (q) {
    query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%`)
  }
  // [BR-MEM-13] 등급 필터 (AND)
  if (tier) {
    query = query.eq('membership_tier', tier)
  }

  const { data, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  const members = (data ?? []) as Member[]
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE))

  // 현재 페이지 회원들의 재방문 권장일 조회 (member_last_visit 뷰)
  const returnDateMap = new Map<string, string | null>()
  if (members.length > 0) {
    const { data: lastVisits } = await supabase
      .from('member_last_visit')
      .select('member_id, recommended_return_date')
      .in(
        'member_id',
        members.map((m) => m.id),
      )
    for (const lv of (lastVisits ?? []) as {
      member_id: string
      recommended_return_date: string | null
    }[]) {
      returnDateMap.set(lv.member_id, lv.recommended_return_date)
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-gray-800">회원 관리</h2>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">총 {count ?? 0}명</p>
        <MemberCreateButton />
      </div>

      <MemberSearchBar />

      {members.length === 0 ? (
        <p
          data-testid="member-empty"
          className="py-12 text-center text-gray-400"
        >
          {q || tier ? '검색 결과가 없습니다.' : '등록된 회원이 없습니다.'}
        </p>
      ) : (
        <MembersBoard
          members={members}
          returnDates={Object.fromEntries(returnDateMap)}
        />
      )}

      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  )
}
