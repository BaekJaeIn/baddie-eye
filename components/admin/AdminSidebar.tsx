import Image from 'next/image'
import AdminNavLinks from './AdminNavLinks'

// 데스크톱 좌측 사이드바. 모바일에서는 숨기고 MobileNavDrawer를 사용한다.
export default function AdminSidebar({
  className = '',
}: {
  className?: string
}) {
  return (
    <aside className={`w-64 flex-col bg-white shadow-sm ${className}`}>
      <div className="border-b border-gray-100 p-4">
        <Image
          src="/logo-pink.png"
          alt="Baddie Eye"
          width={1057}
          height={165}
          className="w-full px-2"
          priority
          unoptimized
        />
        <p className="mt-1 text-center text-xs text-gray-400">관리자</p>
      </div>
      <AdminNavLinks />
    </aside>
  )
}
