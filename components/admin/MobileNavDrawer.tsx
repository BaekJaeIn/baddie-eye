'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import AdminNavLinks from './AdminNavLinks'

// 모바일 전용(md 미만): 햄버거 버튼 + 좌측 슬라이드 드로어 메뉴.
export default function MobileNavDrawer() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // 경로 변경 시 드로어 닫기
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // 열려 있는 동안 ESC 닫기 + 배경 스크롤 잠금
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="admin-mobile-menu-button"
        aria-label="메뉴 열기"
        className="flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50" data-testid="admin-mobile-drawer">
          {/* 배경 */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          {/* 드로어 패널 */}
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-gray-100 p-4">
              <div className="flex-1">
                <Image
                  src="/logo-pink.png"
                  alt="Baddie Eye"
                  width={1057}
                  height={165}
                  className="w-40 px-1"
                  priority
                  unoptimized
                />
                <p className="mt-1 text-xs text-gray-400">관리자</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="메뉴 닫기"
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <AdminNavLinks onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </div>
  )
}
