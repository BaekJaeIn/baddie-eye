import { createClient } from '@/lib/supabase/server'
import { parseMonth, monthRange } from '@/lib/stats/month'
import { aggregateStats, type VisitRecord } from '@/lib/stats/aggregate'
import StatCard from '@/components/stats/StatCard'
import MonthNav from '@/components/stats/MonthNav'
import StatsCharts from '@/components/stats/StatsCharts'

interface StatsPageProps {
  searchParams: { month?: string }
}

interface VisitJoin {
  member_id: string
  price_paid: number
  visited_at: string
  treatment_types: { name: string } | null
}

export default async function StatsPage({ searchParams }: StatsPageProps) {
  const month = parseMonth(searchParams.month)
  const { start, end } = monthRange(month)

  const supabase = createClient()

  // 이번 달 시술 내역
  const { data: visitData } = await supabase
    .from('visit_history')
    .select('member_id, price_paid, visited_at, treatment_types(name)')
    .gte('visited_at', start)
    .lt('visited_at', end)

  const monthVisits = (visitData ?? []) as unknown as VisitJoin[]

  // 방문 회원들의 최초 방문일 (전체 기간) — 신규/재방문 판별 [BR-ST-06]
  const memberIds = [...new Set(monthVisits.map((v) => v.member_id))]
  const firstVisitByMember = new Map<string, string>()
  if (memberIds.length > 0) {
    const { data: allVisits } = await supabase
      .from('visit_history')
      .select('member_id, visited_at')
      .in('member_id', memberIds)
      .order('visited_at', { ascending: true })
    for (const row of (allVisits ?? []) as {
      member_id: string
      visited_at: string
    }[]) {
      if (!firstVisitByMember.has(row.member_id)) {
        firstVisitByMember.set(row.member_id, row.visited_at)
      }
    }
  }

  const records: VisitRecord[] = monthVisits.map((v) => ({
    member_id: v.member_id,
    price_paid: v.price_paid,
    treatment_name: v.treatment_types?.name ?? '기타',
  }))

  const stats = aggregateStats(records, (memberId) => {
    const first = firstVisitByMember.get(memberId)
    return first !== undefined && first >= start && first < end
  })

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-gray-800">매출 통계</h2>
      <MonthNav month={month} />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="총매출"
          value={`${stats.totalRevenue.toLocaleString()}원`}
        />
        <StatCard label="방문 건수" value={`${stats.visitCount}건`} />
        <StatCard
          label="객단가"
          value={`${stats.avgPrice.toLocaleString()}원`}
        />
        <StatCard
          label="재방문율"
          value={`${stats.returnRate}%`}
          sub={`재방문 ${stats.returningMembers} / 신규 ${stats.newMembers}`}
        />
      </div>

      <StatsCharts
        byTreatment={stats.byTreatment}
        newCount={stats.newMembers}
        returningCount={stats.returningMembers}
      />
    </div>
  )
}
