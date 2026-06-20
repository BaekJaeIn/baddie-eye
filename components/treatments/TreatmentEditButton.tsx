'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '@/components/ui/Modal'
import TreatmentForm from './TreatmentForm'
import { updateTreatmentAction } from '@/app/admin/(protected)/treatments/actions'
import type { TreatmentType } from '@/types/database'

export default function TreatmentEditButton({
  treatment,
}: {
  treatment: TreatmentType
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mr-3 text-sm text-gray-500 hover:underline"
      >
        수정
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="시술 수정">
        <TreatmentForm
          action={updateTreatmentAction.bind(null, treatment.id)}
          treatment={treatment}
          onSuccess={() => {
            setOpen(false)
            router.refresh()
          }}
        />
      </Modal>
    </>
  )
}
