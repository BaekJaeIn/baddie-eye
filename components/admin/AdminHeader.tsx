'use client'

import { logoutAction } from '@/app/admin/login/actions'
import MobileNavDrawer from './MobileNavDrawer'

// 헤더: 모바일 햄버거(좌) + 로그아웃(우). 페이지 제목은 각 페이지 본문이 표시.
export default function AdminHeader() {
  return (
    <header className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 md:px-6 md:py-4">
      <MobileNavDrawer />
      <form action={logoutAction} className="ml-auto">
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
