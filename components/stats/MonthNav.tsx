'use client'

import { useRouter } from 'next/navigation'
import { shiftMonth, formatMonth } from '@/lib/stats/month'

export default function MonthNav({ month }: { month: string }) {
  const router = useRouter()

  function go(delta: number) {
    router.push(`/admin/stats?month=${shiftMonth(month, delta)}`)
  }

  return (
    <div className="mb-4 flex items-center gap-3">
      <button
        onClick={() => go(-1)}
        data-testid="month-prev"
        className="rounded-md border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
      >
        ← 이전 달
      </button>
      <span
        data-testid="month-label"
        className="text-lg font-semibold text-gray-800"
      >
        {formatMonth(month)}
      </span>
      <button
        onClick={() => go(1)}
        data-testid="month-next"
        className="rounded-md border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
      >
        다음 달 →
      </button>
    </div>
  )
}
