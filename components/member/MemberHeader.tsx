'use client'

import { logoutMemberAction } from '@/app/(member)/me/actions'

export default function MemberHeader({ name }: { name: string }) {
  return (
    <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
      <div>
        <p className="text-xs text-gray-400">안녕하세요</p>
        <p className="font-semibold text-gray-800">{name}님</p>
      </div>
      <form action={logoutMemberAction}>
        <button
          type="submit"
          data-testid="member-logout-button"
          className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50"
        >
          로그아웃
        </button>
      </form>
    </header>
  )
}
