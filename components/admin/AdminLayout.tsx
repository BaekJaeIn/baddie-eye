import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

// Admin 보호 영역 셸 — 좌측 사이드바 + 상단 헤더 + 메인 콘텐츠.
// 페이지 제목은 각 page가 본문에서 표시한다.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
