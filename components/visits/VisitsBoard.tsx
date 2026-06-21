'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { VisitHistory } from '@/types/database'
import { formatPhone } from '@/lib/format'
import Modal from '@/components/ui/Modal'
import MemberDetailModal from '@/components/members/MemberDetailModal'
import VisitEditForm from './VisitEditForm'
import { updateVisitAction } from '@/app/admin/(protected)/visits/actions'

export interface VisitBoardItem extends VisitHistory {
  member_name: string | null
  member_phone: string | null
  treatment_name: string
}

export default function VisitsBoard({ visits }: { visits: VisitBoardItem[] }) {
  const router = useRouter()
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [editVisit, setEditVisit] = useState<VisitBoardItem | null>(null)

  return (
    <>
      {/* 데스크톱: 테이블 */}
      <div className="hidden overflow-x-auto rounded-lg bg-white shadow-sm md:block">
        <table className="w-full text-sm" data-testid="visit-table">
          <thead className="border-b border-gray-100 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">방문일</th>
              <th className="px-4 py-3">회원</th>
              <th className="px-4 py-3">시술</th>
              <th className="px-4 py-3">결제금액</th>
              <th className="px-4 py-3 text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((v) => (
              <tr key={v.id} className="border-b border-gray-50">
                <td className="px-4 py-3 text-gray-600">
                  {v.visited_at.slice(0, 10)}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  {v.member_name ? (
                    <button
                      type="button"
                      onClick={() => setSelectedMemberId(v.member_id)}
                      className="hover:underline"
                    >
                      {v.member_name}
                    </button>
                  ) : (
                    '(삭제된 회원)'
                  )}
                  {v.member_phone && (
                    <span className="ml-2 text-xs text-gray-400">
                      {formatPhone(v.member_phone)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{v.treatment_name}</td>
                <td className="px-4 py-3 text-gray-600">
                  {v.price_paid.toLocaleString()}원
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setEditVisit(v)}
                    className="text-sm text-gray-500 hover:underline"
                  >
                    편집
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모바일: 카드 목록 */}
      <ul className="space-y-3 md:hidden" data-testid="visit-cards">
        {visits.map((v) => (
          <li key={v.id} className="rounded-lg bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                {v.member_name ? (
                  <button
                    type="button"
                    onClick={() => setSelectedMemberId(v.member_id)}
                    className="font-medium text-gray-800 hover:underline"
                  >
                    {v.member_name}
                  </button>
                ) : (
                  <span className="font-medium text-gray-800">
                    (삭제된 회원)
                  </span>
                )}
                {v.member_phone && (
                  <p className="text-xs text-gray-400">
                    {formatPhone(v.member_phone)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setEditVisit(v)}
                className="shrink-0 text-sm text-gray-500 hover:underline"
              >
                편집
              </button>
            </div>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div>
                <dt className="text-gray-400">방문일</dt>
                <dd className="text-gray-700">{v.visited_at.slice(0, 10)}</dd>
              </div>
              <div>
                <dt className="text-gray-400">시술</dt>
                <dd className="text-gray-700">{v.treatment_name}</dd>
              </div>
              <div>
                <dt className="text-gray-400">결제금액</dt>
                <dd className="text-gray-700">
                  {v.price_paid.toLocaleString()}원
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      {/* 회원 상세 모달 */}
      <MemberDetailModal
        memberId={selectedMemberId}
        onClose={() => setSelectedMemberId(null)}
        onChanged={() => router.refresh()}
      />

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
            onSuccess={() => {
              setEditVisit(null)
              router.refresh()
            }}
          />
        )}
      </Modal>
    </>
  )
}
