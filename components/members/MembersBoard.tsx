'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Member } from '@/types/database'
import { formatPhone } from '@/lib/format'
import { getReturnInfo, formatDday } from '@/lib/visit/recommend'
import Modal from '@/components/ui/Modal'
import MemberCard from './MemberCard'
import MemberForm from './MemberForm'
import DeleteMemberButton from './DeleteMemberButton'
import TierBadge from './TierBadge'
import VisitHistoryList from '@/components/visits/VisitHistoryList'
import {
  updateMemberAction,
  getMemberDetailAction,
  type MemberDetailData,
} from '@/app/admin/(protected)/members/actions'

interface Props {
  members: Member[]
  returnDates: Record<string, string | null>
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className="text-sm text-gray-800">{value}</dd>
    </div>
  )
}

export default function MembersBoard({ members, returnDates }: Props) {
  const router = useRouter()
  const [detail, setDetail] = useState<Member | null>(null)
  const [detailData, setDetailData] = useState<MemberDetailData | null>(null)
  const [loading, setLoading] = useState(false)
  const [edit, setEdit] = useState<Member | null>(null)

  useEffect(() => {
    if (!detail) {
      setDetailData(null)
      return
    }
    let active = true
    setLoading(true)
    getMemberDetailAction(detail.id).then((d) => {
      if (active) {
        setDetailData(d)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [detail])

  const afterChange = () => {
    setDetail(null)
    setEdit(null)
    router.refresh()
  }

  const lastVisit = detailData?.lastVisit
  const returnInfo = lastVisit
    ? getReturnInfo(lastVisit.recommended_return_date)
    : null

  return (
    <>
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        data-testid="member-card-grid"
      >
        {members.map((m) => (
          <MemberCard
            key={m.id}
            member={m}
            recommendedReturnDate={returnDates[m.id] ?? null}
            onSelect={setDetail}
          />
        ))}
      </div>

      {/* 상세 모달 */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="회원 상세">
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  {detail.name}
                </h3>
                <TierBadge tier={detail.membership_tier} />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEdit(detail)
                    setDetail(null)
                  }}
                  data-testid="member-edit-button"
                  className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  수정
                </button>
                <DeleteMemberButton id={detail.id} onDeleted={afterChange} />
              </div>
            </div>

            {detail.allergy_note && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                <p className="mb-1 text-xs font-semibold text-amber-700">
                  알러지 · 주의사항
                </p>
                <p className="whitespace-pre-wrap text-sm text-amber-900">
                  {detail.allergy_note}
                </p>
              </div>
            )}

            <dl className="grid grid-cols-2 gap-3">
              <Field label="연락처" value={formatPhone(detail.phone)} />
              <Field label="포인트" value={`${detail.points}P`} />
              <Field label="생일" value={detail.birthday ?? '-'} />
              <Field label="첫 방문일" value={detail.first_visit_at ?? '-'} />
            </dl>

            {lastVisit?.recommended_return_date && returnInfo && (
              <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
                다음 방문 권장일:{' '}
                <span className="font-medium text-gray-800">
                  {lastVisit.recommended_return_date}
                </span>{' '}
                {returnInfo.dday !== null && `(${formatDday(returnInfo.dday)})`}
              </div>
            )}

            <div>
              <h4 className="mb-2 font-semibold text-gray-800">시술 히스토리</h4>
              {loading ? (
                <p className="text-sm text-gray-400">불러오는 중...</p>
              ) : (
                <VisitHistoryList visits={detailData?.visits ?? []} />
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* 수정 모달 */}
      <Modal open={!!edit} onClose={() => setEdit(null)} title="회원 수정">
        {edit && (
          <MemberForm
            action={updateMemberAction.bind(null, edit.id)}
            member={edit}
            onSuccess={afterChange}
          />
        )}
      </Modal>
    </>
  )
}
