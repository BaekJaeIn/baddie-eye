'use client'

import { useState, useEffect } from 'react'
import type { Member } from '@/types/database'
import { formatPhone } from '@/lib/format'
import { getReturnInfo, formatDday } from '@/lib/visit/recommend'
import Modal from '@/components/ui/Modal'
import MemberForm from './MemberForm'
import DeleteMemberButton from './DeleteMemberButton'
import TierBadge from './TierBadge'
import VisitHistoryList from '@/components/visits/VisitHistoryList'
import VisitEditForm from '@/components/visits/VisitEditForm'
import { updateVisitAction } from '@/app/admin/(protected)/visits/actions'
import {
  updateMemberAction,
  getMemberDetailAction,
  type MemberDetailData,
} from '@/app/admin/(protected)/members/actions'

type VisitItem = MemberDetailData['visits'][number]

interface Props {
  // null이면 닫힘. 값이 있으면 해당 회원 상세를 연다.
  memberId: string | null
  onClose: () => void
  // 수정/삭제 등 변경 발생 시 (목록 갱신용)
  onChanged: () => void
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className="text-sm text-gray-800">{value}</dd>
    </div>
  )
}

export default function MemberDetailModal({
  memberId,
  onClose,
  onChanged,
}: Props) {
  const [data, setData] = useState<MemberDetailData | null>(null)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<Member | null>(null)
  const [editVisit, setEditVisit] = useState<VisitItem | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!memberId) {
      setData(null)
      return
    }
    let active = true
    setLoading(true)
    getMemberDetailAction(memberId).then((d) => {
      if (active) {
        setData(d)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [memberId, reloadKey])

  const member = data?.member ?? null
  const lastVisit = data?.lastVisit
  const returnInfo = lastVisit
    ? getReturnInfo(lastVisit.recommended_return_date)
    : null

  const handleChanged = () => {
    setEditing(null)
    onChanged()
    onClose()
  }

  // 시술 내역 편집 완료 — 모달 내 목록만 갱신하고 상세는 유지
  const handleVisitChanged = () => {
    setEditVisit(null)
    setReloadKey((k) => k + 1)
    onChanged()
  }

  return (
    <>
      {/* 상세 모달 */}
      <Modal
        open={!!memberId && !editing && !editVisit}
        onClose={onClose}
        title="회원 상세"
      >
        {loading || !member ? (
          <p className="py-6 text-center text-sm text-gray-400">
            불러오는 중...
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  {member.name}
                </h3>
                <TierBadge tier={member.membership_tier} />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(member)}
                  data-testid="member-edit-button"
                  className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  수정
                </button>
                <DeleteMemberButton id={member.id} onDeleted={handleChanged} />
              </div>
            </div>

            {member.allergy_note && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                <p className="mb-1 text-xs font-semibold text-amber-700">
                  알러지 · 주의사항
                </p>
                <p className="whitespace-pre-wrap text-sm text-amber-900">
                  {member.allergy_note}
                </p>
              </div>
            )}

            <dl className="grid grid-cols-2 gap-3">
              <Field label="연락처" value={formatPhone(member.phone)} />
              <Field label="포인트" value={`${member.points}P`} />
              <Field label="생일" value={member.birthday ?? '-'} />
              <Field label="첫 방문일" value={member.first_visit_at ?? '-'} />
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
              <VisitHistoryList
                visits={data?.visits ?? []}
                onEdit={(id) => {
                  const v = data?.visits.find((x) => x.id === id)
                  if (v) setEditVisit(v)
                }}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* 수정 모달 */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="회원 수정"
      >
        {editing && (
          <MemberForm
            action={updateMemberAction.bind(null, editing.id)}
            member={editing}
            onSuccess={handleChanged}
          />
        )}
      </Modal>

      {/* 시술 내역 편집 모달 */}
      <Modal
        open={!!editVisit}
        onClose={() => setEditVisit(null)}
        title="시술 내역 편집"
      >
        {editVisit && (
          <VisitEditForm
            action={updateVisitAction.bind(
              null,
              editVisit.id,
              editVisit.member_id,
            )}
            visit={editVisit}
            onSuccess={handleVisitChanged}
          />
        )}
      </Modal>
    </>
  )
}
