'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteTreatmentAction } from '@/app/admin/(protected)/treatments/actions'

export default function DeleteTreatmentButton({ id }: { id: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    if (!confirm('이 시술 종류를 삭제하시겠습니까?')) return
    setPending(true)
    setError(null)
    const result = await deleteTreatmentAction(id)
    if (result.error) {
      setError(result.error)
      setPending(false)
    } else {
      router.refresh()
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        onClick={handleDelete}
        disabled={pending}
        data-testid="treatment-delete-button"
        className="text-sm text-red-600 hover:underline disabled:opacity-60"
      >
        {pending ? '삭제 중...' : '삭제'}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </span>
  )
}
