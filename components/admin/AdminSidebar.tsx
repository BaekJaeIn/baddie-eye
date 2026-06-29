import AdminNavLinks from './AdminNavLinks'
import AccentLine from '@/components/ui/AccentLine'
import Logo from '@/components/ui/Logo'

// 데스크톱 좌측 사이드바. 모바일에서는 숨기고 MobileNavDrawer를 사용한다.
export default function AdminSidebar({
  className = '',
}: {
  className?: string
}) {
  return (
    <aside className={`w-64 flex-col bg-white shadow-sm ${className}`}>
      <AccentLine />
      <div className="border-b border-gray-100 p-4">
        <Logo href="/admin/dashboard" className="mx-auto h-9 w-full" />
        <p className="mt-1 text-center text-xs text-gray-400">관리자</p>
      </div>
      <AdminNavLinks />
    </aside>
  )
}
