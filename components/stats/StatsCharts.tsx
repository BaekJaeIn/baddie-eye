'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import type { TreatmentStat } from '@/lib/stats/aggregate'

interface StatsChartsProps {
  byTreatment: TreatmentStat[]
  newCount: number
  returningCount: number
}

const PIE_COLORS = ['#d6336c', '#f06595'] // 신규, 재방문

export default function StatsCharts({
  byTreatment,
  newCount,
  returningCount,
}: StatsChartsProps) {
  const hasTreatment = byTreatment.length > 0
  const pieData = [
    { name: '신규', value: newCount },
    { name: '재방문', value: returningCount },
  ]
  const hasPie = newCount + returningCount > 0

  return (
    <div className="grid gap-6 lg:grid-cols-2" data-testid="stats-charts">
      {/* 시술별 매출 */}
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          시술별 매출
        </h3>
        {hasTreatment ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={byTreatment}
              layout="vertical"
              margin={{ left: 20, right: 20 }}
            >
              <XAxis type="number" tickFormatter={(v) => v.toLocaleString()} />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(v: number) => `${v.toLocaleString()}원`}
              />
              <Bar dataKey="revenue" fill="#d6336c" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="py-12 text-center text-sm text-gray-400">
            데이터가 없습니다.
          </p>
        )}
      </div>

      {/* 신규 vs 재방문 */}
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          신규 vs 재방문
        </h3>
        {hasPie ? (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                label={(e) => `${e.name} ${e.value}`}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip formatter={(v: number) => `${v}명`} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="py-12 text-center text-sm text-gray-400">
            데이터가 없습니다.
          </p>
        )}
      </div>
    </div>
  )
}
