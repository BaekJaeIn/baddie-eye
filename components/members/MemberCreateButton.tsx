'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '@/components/ui/Modal'
import MemberForm from './MemberForm'
import { createMemberAction } from '@/app/admin/(protected)/members/actions'

export default function MemberCreateButton() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        data-testid="member-create-button"
        className="rounded-md bg-brand px-4 py-2 text-sm text-white hover:bg-brand-dark"
      >
        + 회원 등록
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="회원 등록">
        <MemberForm
          action={createMemberAction}
          onSuccess={() => {
            setOpen(false)
            router.refresh()
          }}
        />
      </Modal>
    </>
  )
}
