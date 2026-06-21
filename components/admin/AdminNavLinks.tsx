'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navItems } from './nav-items'

// 사이드바/모바일 드로어에서 공통으로 쓰는 메뉴 링크 목록.
// onNavigate: 모바일 드로어에서 메뉴 클릭 시 드로어를 닫기 위한 콜백.
export default function AdminNavLinks({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 p-4">
      <ul className="space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                data-testid={`admin-nav-${item.href.split('/').pop()}`}
                className={
                  isActive
                    ? 'block rounded-md bg-brand-light/10 px-3 py-2 font-medium text-brand'
                    : 'block rounded-md px-3 py-2 text-gray-700 transition hover:bg-gray-50'
                }
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
