import Link from 'next/link'
import MemberForm from '@/components/members/MemberForm'
import { createMemberAction } from '../actions'

export default function NewMemberPage() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Link href="/admin/members" className="text-sm text-gray-400 hover:text-gray-600">
          ← 회원 목록
        </Link>
      </div>
      <h2 className="mb-6 text-xl font-semibold text-gray-800">회원 등록</h2>
      <MemberForm action={createMemberAction} />
    </div>
  )
}
