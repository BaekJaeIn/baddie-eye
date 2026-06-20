import { describe, it, expect } from 'vitest'
import { aggregateStats, type VisitRecord } from '@/lib/stats/aggregate'

const visits: VisitRecord[] = [
  { member_id: 'a', price_paid: 50000, treatment_name: '자연' },
  { member_id: 'a', price_paid: 30000, treatment_name: '볼륨' },
  { member_id: 'b', price_paid: 50000, treatment_name: '자연' },
  { member_id: 'c', price_paid: 20000, treatment_name: '리터치' },
]

describe('aggregateStats', () => {
  // a=신규, b/c=재방문 가정
  const isNew = (id: string) => id === 'a'

  it('총매출/건수/객단가 계산', () => {
    const r = aggregateStats(visits, isNew)
    expect(r.totalRevenue).toBe(150000)
    expect(r.visitCount).toBe(4)
    expect(r.avgPrice).toBe(37500)
  })

  it('시술별 매출 집계 + 내림차순', () => {
    const r = aggregateStats(visits, isNew)
    expect(r.byTreatment[0]).toEqual({
      name: '자연',
      count: 2,
      revenue: 100000,
    })
    expect(r.byTreatment.map((t) => t.name)).toEqual(['자연', '볼륨', '리터치'])
  })

  it('신규/재방문/재방문율', () => {
    const r = aggregateStats(visits, isNew)
    // 방문 회원 a,b,c=3명, 신규 a=1, 재방문 2
    expect(r.newMembers).toBe(1)
    expect(r.returningMembers).toBe(2)
    expect(r.returnRate).toBe(67) // 2/3 = 66.6 → 67
  })

  it('빈 입력 처리', () => {
    const r = aggregateStats([], () => false)
    expect(r.totalRevenue).toBe(0)
    expect(r.avgPrice).toBe(0)
    expect(r.returnRate).toBe(0)
    expect(r.byTreatment).toEqual([])
  })

  it('시술명 없으면 기타로 집계', () => {
    const r = aggregateStats(
      [{ member_id: 'x', price_paid: 1000, treatment_name: '' }],
      () => true,
    )
    expect(r.byTreatment[0].name).toBe('기타')
  })
})
