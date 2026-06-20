'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
  // 페이지 링크 기준 경로. 기본은 현재 경로.
  basePath?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
}: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const target = basePath ?? pathname

  if (totalPages <= 1) return null

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`${target}?${params.toString()}`)
  }

  return (
    <nav
      className="mt-6 flex items-center justify-center gap-1"
      data-testid="pagination"
    >
      <button
        disabled={currentPage <= 1}
        onClick={() => goToPage(currentPage - 1)}
        className="rounded-md border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40"
      >
        이전
      </button>
      <span className="px-3 text-sm text-gray-600">
        {currentPage} / {totalPages}
      </span>
      <button
        disabled={currentPage >= totalPages}
        onClick={() => goToPage(currentPage + 1)}
        className="rounded-md border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40"
      >
        다음
      </button>
    </nav>
  )
}
