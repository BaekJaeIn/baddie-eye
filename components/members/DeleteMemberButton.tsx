'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteMemberAction } from '@/app/admin/(protected)/members/actions'
import { useConfirm } from '@/components/ui/ConfirmDialog'

export default function DeleteMemberButton({
  id,
  onDeleted,
}: {
  id: string
  // 삭제 후 콜백 (모달). 없으면 목록으로 이동.
  onDeleted?: () => void
}) {
  const [pending, setPending] = useState(false)
  const router = useRouter()
  const confirm = useConfirm()

  async function handleDelete() {
    const ok = await confirm({
      title: '회원 삭제',
      message: '정말 삭제하시겠습니까?\n(예약/시술 내역은 보존됩니다)',
      confirmText: '삭제',
      destructive: true,
    })
    if (!ok) return
    setPending(true)
    await deleteMemberAction(id)
    if (onDeleted) onDeleted()
    else router.push('/admin/members')
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      data-testid="member-delete-button"
      className="rounded-md border border-red-200 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-60"
    >
      {pending ? '삭제 중...' : '삭제'}
    </button>
  )
}
