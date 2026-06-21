import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Member, MemberLastVisit } from '@/types/database'
import { tierLabel } from '@/lib/format'
import { getReturnInfo, formatDday } from '@/lib/visit/recommend'
import MemberHeader from '@/components/member/MemberHeader'
import MyVisitHistory, {
  type MyVisitItem,
} from '@/components/member/MyVisitHistory'
import PushSubscriptionManager from '@/components/push/PushSubscriptionManager'
import InstallButton from '@/components/pwa/InstallButton'

interface VisitRow {
  id: string
  visited_at: string
  price_paid: number
  before_after_photo_url: string | null
  treatment_types: { name: string } | null
}

export default async function MyPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 내 회원 정보 (RLS로 자기 것만)
  const { data: memberData } = await supabase
    .from('members')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  // 미연결 → 온보딩
  if (!memberData) redirect('/onboarding')
  const member = memberData as Member

  // 시술 히스토리 + 재방문 권장
  const [{ data: visitData }, { data: lastVisitData }] = await Promise.all([
    supabase
      .from('visit_history')
      .select(
        'id, visited_at, price_paid, before_after_photo_url, treatment_types(name)',
      )
      .eq('member_id', member.id)
      .order('visited_at', { ascending: false }),
    supabase
      .from('member_last_visit')
      .select('*')
      .eq('member_id', member.id)
      .maybeSingle(),
  ])

  const visitRows = (visitData ?? []) as unknown as VisitRow[]
  const visits: MyVisitItem[] = visitRows.map((v) => ({
    id: v.id,
    visited_at: v.visited_at,
    price_paid: v.price_paid,
    before_after_photo_url: v.before_after_photo_url,
    treatment_name: v.treatment_types?.name ?? '-',
  }))

  const lastVisit = lastVisitData as MemberLastVisit | null
  const returnInfo = lastVisit
    ? getReturnInfo(lastVisit.recommended_return_date)
    : null

  return (
    <div>
      <MemberHeader name={member.name} />

      <div className="space-y-5 p-5">
        {/* 등급/포인트 */}
        <div className="rounded-xl bg-brand-light/10 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">멤버십 등급</p>
              <p className="text-lg font-bold text-brand-dark">
                {tierLabel(member.membership_tier)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">포인트</p>
              <p className="text-lg font-bold text-brand-dark">
                {member.points.toLocaleString()}P
              </p>
            </div>
          </div>
        </div>

        {/* 예약 액션 */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/booking"
            data-testid="me-booking-link"
            className="rounded-xl bg-brand py-3 text-center font-medium text-white hover:bg-brand-dark"
          >
            예약하기
          </Link>
          <Link
            href="/me/appointments"
            data-testid="me-appointments-link"
            className="rounded-xl border border-gray-200 py-3 text-center font-medium text-gray-700 hover:bg-gray-50"
          >
            내 예약
          </Link>
        </div>

        {/* 재방문 권장 */}
        {lastVisit?.recommended_return_date && returnInfo && (
          <div className="rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-600">
              다음 방문 권장일:{' '}
              <span className="font-semibold text-gray-800">
                {lastVisit.recommended_return_date}
              </span>{' '}
              {returnInfo.dday !== null && (
                <span className="text-brand">
                  ({formatDday(returnInfo.dday)})
                </span>
              )}
            </p>
          </div>
        )}

        {/* 시술 히스토리 */}
        <div>
          <h2 className="mb-3 font-semibold text-gray-800">시술 내역</h2>
          <MyVisitHistory visits={visits} />
        </div>

        {/* 푸시 알림 구독 (자동 시도) */}
        <PushSubscriptionManager />

        {/* 앱 설치 (미설치 상태에서만 노출) */}
        <InstallButton />
      </div>
    </div>
  )
}
