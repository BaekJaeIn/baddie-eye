import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { VisitHistory } from '@/types/database'
import VisitEditForm from '@/components/visits/VisitEditForm'
import { updateVisitAction } from '../../actions'

interface VisitEditPageProps {
  params: { id: string }
}

export default async function VisitEditPage({ params }: VisitEditPageProps) {
  const supabase = createClient()
  const { data } = await supabase
    .from('visit_history')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!data) notFound()
  const visit = data as VisitHistory
  const action = updateVisitAction.bind(null, visit.id, visit.member_id)

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/admin/members/${visit.member_id}`}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ← 회원 상세
        </Link>
      </div>
      <h2 className="mb-6 text-xl font-semibold text-gray-800">시술 내역 편집</h2>
      <VisitEditForm action={action} visit={visit} />
    </div>
  )
}
