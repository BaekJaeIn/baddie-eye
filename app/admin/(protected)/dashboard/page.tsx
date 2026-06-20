import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { toDateStr, shiftWeek, getWeekStart } from '@/lib/booking/slots'
import { getReturnInfo, formatDday } from '@/lib/visit/recommend'

interface ReturnRow {
  member_id: string
  recommended_return_date: string | null
  treatment_name: string
  members: { name: string } | null
}

export default async function DashboardPage() {
  const supabase = createClient()

  // 원장 이름 — auth user_metadata.name (없으면 미표시)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const adminName =
    (user?.user_metadata?.name as string | undefined)?.trim() || ''

  // 재방문 권장: 권장일이 오늘+7일 이내(경과 포함)인 회원
  const today = toDateStr(new Date())
  const horizon = shiftWeek(getWeekStart(new Date()), 2) // 넉넉히 2주 뒤까지 스캔
  const { data } = await supabase
    .from('member_last_visit')
    .select('member_id, recommended_return_date, treatment_name, members(name)')
    .not('recommended_return_date', 'is', null)
    .lte('recommended_return_date', horizon)
    .order('recommended_return_date', { ascending: true })

  const rows = (data ?? []) as unknown as ReturnRow[]
  // 오늘+7일 이내(경과/임박)만 필터
  const dueSoon = rows.filter((r) => {
    const { status } = getReturnInfo(r.recommended_return_date)
    return status === 'overdue' || status === 'soon'
  })

  // 승인 대기(requested) 예약 건수
  const { count: requestedCount } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'requested')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          안녕하세요, {adminName ? `${adminName} ` : ''}원장님!
        </h2>
        <p className="mt-1 text-sm text-gray-500">오늘은 {today} 입니다.</p>
      </div>

      {(requestedCount ?? 0) > 0 && (
        <Link
          href="/admin/appointments"
          data-testid="dashboard-requested-banner"
          className="block rounded-lg bg-amber-50 p-4 text-sm text-amber-800 hover:bg-amber-100"
        >
          ⏳ 승인 대기 중인 예약 신청이 <b>{requestedCount}건</b> 있습니다. →
        </Link>
      )}

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-3 font-semibold text-gray-800">
          재방문 권장 회원
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({dueSoon.length}명)
          </span>
        </h3>
        {dueSoon.length === 0 ? (
          <p className="text-sm text-gray-400" data-testid="dashboard-return-empty">
            이번 주 재방문 권장 회원이 없습니다.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100" data-testid="dashboard-return-list">
            {dueSoon.map((r) => {
              const { dday } = getReturnInfo(r.recommended_return_date)
              return (
                <li
                  key={r.member_id}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <Link
                      href={`/admin/members/${r.member_id}`}
                      className="text-sm font-medium text-gray-800 hover:underline"
                    >
                      {r.members?.name ?? '(회원)'}
                    </Link>
                    <span className="ml-2 text-xs text-gray-400">
                      {r.treatment_name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {r.recommended_return_date}{' '}
                    {dday !== null && `(${formatDday(dday)})`}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
