import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Member, MemberLastVisit } from '@/types/database'
import { formatPhone } from '@/lib/format'
import { formatDday, getReturnInfo } from '@/lib/visit/recommend'
import TierBadge from '@/components/members/TierBadge'
import DeleteMemberButton from '@/components/members/DeleteMemberButton'
import ReturnBadge from '@/components/visits/ReturnBadge'
import VisitHistoryList, {
  type VisitListItem,
} from '@/components/visits/VisitHistoryList'

interface MemberDetailPageProps {
  params: { id: string }
}

interface VisitJoinRow {
  id: string
  visited_at: string
  price_paid: number
  before_after_photo_url: string | null
  treatment_types: { name: string } | null
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className="text-sm text-gray-800">{value}</dd>
    </div>
  )
}

export default async function MemberDetailPage({
  params,
}: MemberDetailPageProps) {
  const supabase = createClient()
  const { data } = await supabase
    .from('members')
    .select('*')
    .eq('id', params.id)
    .eq('is_active', true)
    .single()

  if (!data) notFound()
  const member = data as Member

  // 재방문 권장(뷰) + 시술 히스토리 병렬 조회
  const [{ data: lastVisitData }, { data: visitData }] = await Promise.all([
    supabase
      .from('member_last_visit')
      .select('*')
      .eq('member_id', member.id)
      .maybeSingle(),
    supabase
      .from('visit_history')
      .select('id, visited_at, price_paid, before_after_photo_url, treatment_types(name)')
      .eq('member_id', member.id)
      .order('visited_at', { ascending: false }),
  ])

  const lastVisit = lastVisitData as MemberLastVisit | null
  const visitRows = (visitData ?? []) as unknown as VisitJoinRow[]
  const visits: VisitListItem[] = visitRows.map((v) => ({
    id: v.id,
    visited_at: v.visited_at,
    price_paid: v.price_paid,
    before_after_photo_url: v.before_after_photo_url,
    treatment_name: v.treatment_types?.name ?? '-',
  }))

  const returnInfo = lastVisit
    ? getReturnInfo(lastVisit.recommended_return_date)
    : null

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-2">
        <Link
          href="/admin/members"
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ← 회원 목록
        </Link>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-800">
              {member.name}
            </h2>
            <TierBadge tier={member.membership_tier} />
          </div>
          <div className="flex gap-2">
            <Link
              href={`/admin/members/${member.id}/edit`}
              data-testid="member-edit-link"
              className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              수정
            </Link>
            <DeleteMemberButton id={member.id} />
          </div>
        </div>

        {member.allergy_note && (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3">
            <p className="mb-1 text-xs font-semibold text-amber-700">
              알러지 · 주의사항
            </p>
            <p className="whitespace-pre-wrap text-sm text-amber-900">
              {member.allergy_note}
            </p>
          </div>
        )}

        <dl className="grid grid-cols-2 gap-4">
          <Field label="연락처" value={formatPhone(member.phone)} />
          <Field label="포인트" value={`${member.points}P`} />
          <Field label="생일" value={member.birthday ?? '-'} />
          <Field label="첫 방문일" value={member.first_visit_at ?? '-'} />
        </dl>
      </div>

      {/* 재방문 권장 */}
      {lastVisit && (
        <div className="mt-4 rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">재방문 권장</h3>
            <ReturnBadge
              recommendedReturnDate={lastVisit.recommended_return_date}
              showLater
            />
          </div>
          <p className="text-sm text-gray-600">
            마지막 시술: {lastVisit.treatment_name} (
            {lastVisit.visited_at.slice(0, 10)})
          </p>
          {lastVisit.recommended_return_date && returnInfo?.dday !== null ? (
            <p className="text-sm text-gray-600">
              권장 재방문일: {lastVisit.recommended_return_date} (
              {returnInfo && formatDday(returnInfo.dday!)})
            </p>
          ) : (
            <p className="text-xs text-gray-400">
              이 시술은 권장 주기가 설정되지 않았습니다.
            </p>
          )}
        </div>
      )}

      {/* 시술 히스토리 */}
      <div className="mt-4 rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-3 font-semibold text-gray-800">시술 히스토리</h3>
        <VisitHistoryList visits={visits} />
      </div>
    </div>
  )
}
