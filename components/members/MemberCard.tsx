'use client'

import { formatPhone } from '@/lib/format'
import type { Member } from '@/types/database'
import TierBadge from './TierBadge'
import ReturnBadge from '@/components/visits/ReturnBadge'

export default function MemberCard({
  member,
  recommendedReturnDate = null,
  onSelect,
}: {
  member: Member
  recommendedReturnDate?: string | null
  onSelect: (member: Member) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(member)}
      data-testid="member-card"
      className="block w-full rounded-lg bg-white p-4 text-left shadow-sm transition hover:shadow-md"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="font-semibold text-gray-800">{member.name}</h3>
        <div className="flex items-center gap-1">
          <ReturnBadge recommendedReturnDate={recommendedReturnDate} />
          <TierBadge tier={member.membership_tier} />
        </div>
      </div>
      <p className="text-sm text-gray-600">{formatPhone(member.phone)}</p>
      {member.first_visit_at && (
        <p className="mt-1 text-xs text-gray-400">
          첫 방문: {member.first_visit_at}
        </p>
      )}
      {member.allergy_note && (
        <p className="mt-2 line-clamp-2 rounded bg-amber-50 px-1.5 py-1 text-xs text-amber-800">
          {member.allergy_note}
        </p>
      )}
    </button>
  )
}
