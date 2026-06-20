'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '@/components/ui/Modal'
import TreatmentForm from './TreatmentForm'
import { createTreatmentAction } from '@/app/admin/(protected)/treatments/actions'

export default function TreatmentCreateButton() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        data-testid="treatment-create-button"
        className="rounded-md bg-brand px-4 py-2 text-sm text-white hover:bg-brand-dark"
      >
        + 시술 등록
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="시술 등록">
        <TreatmentForm
          action={createTreatmentAction}
          onSuccess={() => {
            setOpen(false)
            router.refresh()
          }}
        />
      </Modal>
    </>
  )
}
