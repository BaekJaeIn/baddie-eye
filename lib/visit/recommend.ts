// 재방문 권장 D-day / 상태 계산 [BR-RC-04]

export type ReturnStatus = 'overdue' | 'soon' | 'later' | 'none'

export interface ReturnInfo {
  status: ReturnStatus
  dday: number | null // 음수=경과, 양수=남음
}

const SOON_THRESHOLD_DAYS = 7

// recommendedReturnDate: 'YYYY-MM-DD' | null
// today: 비교 기준일 (테스트용 주입 가능)
export function getReturnInfo(
  recommendedReturnDate: string | null,
  today: Date = new Date(),
): ReturnInfo {
  if (!recommendedReturnDate) return { status: 'none', dday: null }

  const [y, m, d] = recommendedReturnDate.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const dday = Math.round(
    (target.getTime() - base.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (dday < 0) return { status: 'overdue', dday }
  if (dday <= SOON_THRESHOLD_DAYS) return { status: 'soon', dday }
  return { status: 'later', dday }
}

// D-day 표시 문자열
export function formatDday(dday: number): string {
  if (dday === 0) return 'D-day'
  if (dday < 0) return `${Math.abs(dday)}일 경과`
  return `D-${dday}`
}
