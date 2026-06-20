'use client'

import { logoutAction } from '@/app/admin/login/actions'

// 헤더는 로그아웃만 담당. 페이지 제목은 각 페이지 본문이 표시한다
// (App Router 레이아웃은 자식 페이지의 제목을 알 수 없으므로).
export default function AdminHeader() {
  return (
    <header className="flex items-center justify-end border-b border-gray-100 bg-white px-6 py-4">
      <form action={logoutAction}>
        <button
          type="submit"
          data-testid="admin-header-logout-button"
          className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50"
        >
          로그아웃
        </button>
      </form>
    </header>
  )
}
