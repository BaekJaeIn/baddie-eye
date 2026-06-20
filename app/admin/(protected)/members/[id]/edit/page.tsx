import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Member } from '@/types/database'
import MemberForm from '@/components/members/MemberForm'
import { updateMemberAction } from '../../actions'

interface EditMemberPageProps {
  params: { id: string }
}

export default async function EditMemberPage({ params }: EditMemberPageProps) {
  const supabase = createClient()
  const { data } = await supabase
    .from('members')
    .select('*')
    .eq('id', params.id)
    .eq('is_active', true)
    .single()

  if (!data) notFound()
  const member = data as Member

  // id를 bind하여 (prev, formData) 시그니처로 변환
  const action = updateMemberAction.bind(null, member.id)

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Link
          href={`/admin/members/${member.id}`}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ← 회원 상세
        </Link>
      </div>
      <h2 className="mb-6 text-xl font-semibold text-gray-800">회원 수정</h2>
      <MemberForm action={action} member={member} />
    </div>
  )
}
