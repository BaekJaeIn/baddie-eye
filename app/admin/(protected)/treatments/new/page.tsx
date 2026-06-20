import Link from 'next/link'
import TreatmentForm from '@/components/treatments/TreatmentForm'
import { createTreatmentAction } from '../actions'

export default function NewTreatmentPage() {
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
      <h2 className="mb-6 text-xl font-semibold text-gray-800">시술 등록</h2>
      <TreatmentForm action={createTreatmentAction} />
    </div>
  )
}
