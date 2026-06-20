'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function MemberSearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const [tier, setTier] = useState(searchParams.get('tier') ?? '')

  function applyFilters(nextQ: string, nextTier: string) {
    const params = new URLSearchParams()
    if (nextQ.trim()) params.set('q', nextQ.trim())
    if (nextTier) params.set('tier', nextTier)
    // 필터 변경 시 1페이지로
    router.push(`/admin/members?${params.toString()}`)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    applyFilters(q, tier)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 flex flex-wrap gap-2"
      data-testid="member-search-bar"
    >
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="이름 또는 연락처 검색"
        data-testid="member-search-input"
        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
      />
      <select
        value={tier}
        onChange={(e) => {
          setTier(e.target.value)
          applyFilters(q, e.target.value)
        }}
        data-testid="member-tier-filter"
        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
      >
        <option value="">전체 등급</option>
        <option value="regular">일반</option>
        <option value="loyal">단골</option>
        <option value="vip">VIP</option>
      </select>
      <button
        type="submit"
        data-testid="member-search-submit"
        className="rounded-md bg-brand px-4 py-2 text-sm text-white hover:bg-brand-dark"
      >
        검색
      </button>
    </form>
  )
}
