// 매출 통계 집계 — 순수 함수 [BR-ST-03~09]

export interface VisitRecord {
  member_id: string
  price_paid: number
  treatment_name: string
}

export interface TreatmentStat {
  name: string
  count: number
  revenue: number
}

export interface StatsResult {
  totalRevenue: number
  visitCount: number
  avgPrice: number
  byTreatment: TreatmentStat[]
  newMembers: number
  returningMembers: number
  returnRate: number // 0~100
}

// isNewMember: 해당 회원의 최초 방문이 조회 월 범위 내인지 [BR-ST-06,07]
export function aggregateStats(
  visits: VisitRecord[],
  isNewMember: (memberId: string) => boolean,
): StatsResult {
  const totalRevenue = visits.reduce((s, v) => s + v.price_paid, 0)
  const visitCount = visits.length
  const avgPrice = visitCount > 0 ? Math.round(totalRevenue / visitCount) : 0

  // 시술별 집계 [BR-ST-05]
  const treatmentMap = new Map<string, TreatmentStat>()
  for (const v of visits) {
    const name = v.treatment_name || '기타' // [BR-ST-10]
    const cur = treatmentMap.get(name) ?? { name, count: 0, revenue: 0 }
    cur.count += 1
    cur.revenue += v.price_paid
    treatmentMap.set(name, cur)
  }
  const byTreatment = [...treatmentMap.values()].sort(
    (a, b) => b.revenue - a.revenue,
  )

  // 신규/재방문 [BR-ST-07~09]
  const uniqueMembers = new Set(visits.map((v) => v.member_id))
  let newMembers = 0
  for (const memberId of uniqueMembers) {
    if (isNewMember(memberId)) newMembers += 1
  }
  const visitorCount = uniqueMembers.size
  const returningMembers = visitorCount - newMembers
  const returnRate =
    visitorCount > 0 ? Math.round((returningMembers / visitorCount) * 100) : 0

  return {
    totalRevenue,
    visitCount,
    avgPrice,
    byTreatment,
    newMembers,
    returningMembers,
    returnRate,
  }
}
