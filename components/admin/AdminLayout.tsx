import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import PushSubscriptionManager from '@/components/push/PushSubscriptionManager'

// Admin 보호 영역 셸 — 좌측 사이드바 + 상단 헤더 + 메인 콘텐츠.
// 페이지 제목은 각 page가 본문에서 표시한다.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar className="hidden md:flex" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
      {/* 원장 알림 구독 (예약 신청 시 푸시) — 화면에 보이지 않음 */}
      <div className="sr-only">
        <PushSubscriptionManager owner />
      </div>
    </div>
  )
}
