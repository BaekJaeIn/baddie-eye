import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { TreatmentType } from '@/types/database'
import TreatmentForm from '@/components/treatments/TreatmentForm'
import { updateTreatmentAction } from '../../actions'

interface EditTreatmentPageProps {
  params: { id: string }
}

export default async function EditTreatmentPage({
  params,
}: EditTreatmentPageProps) {
  const supabase = createClient()
  const { data } = await supabase
    .from('treatment_types')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!data) notFound()
  const treatment = data as TreatmentType
  const action = updateTreatmentAction.bind(null, treatment.id)

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/treatments"
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ← 시술 종류
        </Link>
      </div>
      <h2 className="mb-6 text-xl font-semibold text-gray-800">시술 수정</h2>
      <TreatmentForm action={action} treatment={treatment} />
    </div>
  )
}
