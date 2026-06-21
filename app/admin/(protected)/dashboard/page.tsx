import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  toDateStr,
  shiftWeek,
  getWeekStart,
  combineDateTime,
  extractTime,
  extractKstDate,
} from '@/lib/booking/slots'
import { getReturnInfo, formatDday } from '@/lib/visit/recommend'
import { STATUS_LABEL, STATUS_STYLE } from '@/lib/booking/status'
import type { AppointmentStatus } from '@/types/database'
import RequestedAppointmentsBanner, {
  type RequestedItem,
} from '@/components/appointments/RequestedAppointmentsBanner'
import InstallButton from '@/components/pwa/InstallButton'

interface ReturnRow {
  member_id: string
  recommended_return_date: string | null
  treatment_name: string
  members: { name: string } | null
}

interface RequestedRow {
  id: string
  scheduled_at: string
  memo: string | null
  members: { name: string; phone: string } | null
  treatment_types: { name: string } | null
}

interface TodayRow {
  id: string
  scheduled_at: string
  status: AppointmentStatus
  members: { name: string } | null
  treatment_types: { name: string } | null
}

export default async function DashboardPage() {
  const supabase = createClient()

  // 원장 이름 — auth user_metadata.name (없으면 미표시)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const adminName =
    (user?.user_metadata?.name as string | undefined)?.trim() || ''

  // 오늘(KST) — 서버가 UTC라도 정확히 KST 기준 날짜
  const today = extractKstDate(new Date().toISOString())

  // 재방문 권장: 권장일이 오늘+7일 이내(경과 포함)인 회원
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

  // 승인 대기(requested) 예약 — 배너 클릭 시 모달에 표시할 상세 목록
  const { data: requestedData } = await supabase
    .from('appointments')
    .select(
      'id, scheduled_at, memo, members(name, phone), treatment_types(name)',
    )
    .eq('status', 'requested')
    .order('scheduled_at', { ascending: true })
  const requestedItems: RequestedItem[] = (
    (requestedData ?? []) as unknown as RequestedRow[]
  ).map((r) => ({
    id: r.id,
    scheduled_at: r.scheduled_at,
    member_name: r.members?.name ?? '(삭제된 회원)',
    member_phone: r.members?.phone ?? null,
    treatment_name: r.treatment_types?.name ?? '(삭제된 시술)',
    memo: r.memo,
  }))

  // 오늘의 시술: 오늘(KST) 확정/완료 예약 (시간순)
  const [y, m, d] = today.split('-').map(Number)
  const tomorrow = toDateStr(new Date(y, m - 1, d + 1))
  const { data: todayData } = await supabase
    .from('appointments')
    .select(
      'id, scheduled_at, status, members(name), treatment_types(name)',
    )
    .in('status', ['pending', 'completed'])
    .gte('scheduled_at', combineDateTime(today, '00:00'))
    .lt('scheduled_at', combineDateTime(tomorrow, '00:00'))
    .order('scheduled_at', { ascending: true })
  const todayAppts = (todayData ?? []) as unknown as TodayRow[]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          안녕하세요, {adminName ? `${adminName} ` : ''}원장님!
        </h2>
        <p className="mt-1 text-sm text-gray-500">오늘은 {today} 입니다.</p>
      </div>

      {/* 관리자 앱 설치 (미설치 시에만 노출) */}
      <InstallButton />

      <RequestedAppointmentsBanner appointments={requestedItems} />

      {/* 오늘의 시술 */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">
            오늘의 시술
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({todayAppts.length}건)
            </span>
          </h3>
          <Link
            href="/admin/appointments"
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            예약 관리 →
          </Link>
        </div>
        {todayAppts.length === 0 ? (
          <p
            className="text-sm text-gray-400"
            data-testid="dashboard-today-empty"
          >
            오늘 예정된 시술이 없습니다.
          </p>
        ) : (
          <ul
            className="divide-y divide-gray-100"
            data-testid="dashboard-today-list"
          >
            {todayAppts.map((appt) => (
              <li key={appt.id}>
                <Link
                  href={`/admin/appointments/${appt.id}`}
                  className="flex items-center justify-between gap-3 py-2.5 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-12 shrink-0 text-sm font-medium text-gray-800">
                      {extractTime(appt.scheduled_at)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {appt.members?.name ?? '(삭제된 회원)'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {appt.treatment_types?.name ?? '(삭제된 시술)'}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[appt.status]}`}
                  >
                    {STATUS_LABEL[appt.status]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

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
