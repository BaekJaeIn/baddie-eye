'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Member } from '@/types/database'
import MemberCard from './MemberCard'
import MemberDetailModal from './MemberDetailModal'

interface Props {
  members: Member[]
  returnDates: Record<string, string | null>
}

export default function MembersBoard({ members, returnDates }: Props) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(null)

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
            onSelect={(member) => setSelectedId(member.id)}
          />
        ))}
      </div>

      <MemberDetailModal
        memberId={selectedId}
        onClose={() => setSelectedId(null)}
        onChanged={() => router.refresh()}
      />
    </>
  )
}
