'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

interface NavItem {
  label: string
  href: string
}

// 구현된 메뉴만 점진적 추가.
const navItems: NavItem[] = [
  { label: '대시보드', href: '/admin/dashboard' },
  { label: '회원 관리', href: '/admin/members' }, // Bolt 2
  { label: '예약 관리', href: '/admin/appointments' }, // Bolt 3
  { label: '시술 종류', href: '/admin/treatments' }, // Bolt 3
  { label: '시술 내역', href: '/admin/visits' }, // Bolt 3.5
  { label: '통계', href: '/admin/stats' }, // Bolt 7
  { label: '앱 설치 안내', href: '/admin/install' }, // QR 안내
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-64 flex-col bg-white shadow-sm">
      <div className="border-b border-gray-100 p-4">
        <Image
          src="/logo-admin.png"
          alt="Baddie Eye"
          width={560}
          height={121}
          className="w-full rounded-md"
          priority
          unoptimized
        />
        <p className="mt-1 text-center text-xs text-gray-400">관리자</p>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + '/')
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
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
    </aside>
  )
}
