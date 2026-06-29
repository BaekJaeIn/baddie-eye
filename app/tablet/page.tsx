import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Member } from '@/types/database'
import { formatPhone, tierLabel } from '@/lib/format'
import InstallButton from '@/components/pwa/InstallButton'

interface TabletHomeProps {
  searchParams: { q?: string }
}

// 태블릿 동의서 — 1단계: 회원 선택
// 관리자가 매장에서 등록된 회원을 검색해 선택한다.
// 신규 고객은 관리자 앱(회원 관리)에서 먼저 등록한다.
export default async function TabletHome({ searchParams }: TabletHomeProps) {
  const q = searchParams.q?.trim() ?? ''

  const supabase = createClient()
  let members: Member[] = []

  if (q) {
    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${q}%,phone.ilike.%${q}%`)
      .order('name', { ascending: true })
      .limit(30)
    members = (data ?? []) as Member[]
  }

  return (
    <div>
      <h2 className="mb-2 text-2xl font-semibold text-gray-800">
        동의받을 회원을 선택하세요
      </h2>
      <p className="mb-6 text-gray-500">
        이름 또는 전화번호로 검색하세요. 신규 고객은 관리자 앱의 &lsquo;회원
        관리&rsquo;에서 먼저 등록해 주세요.
      </p>

      <form method="get" className="mb-6 flex gap-3">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="이름 또는 전화번호"
          autoFocus
          className="flex-1 rounded-xl border border-gray-300 px-5 py-4 text-lg focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <button
          type="submit"
          className="rounded-xl bg-brand px-8 py-4 text-lg font-semibold text-white hover:bg-brand-dark"
        >
          검색
        </button>
      </form>

      {q && members.length === 0 && (
        <p
          data-testid="tablet-member-empty"
          className="py-12 text-center text-gray-400"
        >
          검색 결과가 없습니다. 관리자 앱에서 회원을 먼저 등록해 주세요.
        </p>
      )}

      <ul className="space-y-3" data-testid="tablet-member-list">
        {members.map((m) => (
          <li key={m.id}>
            <Link
              href={`/tablet/${m.id}`}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 text-left shadow-sm transition hover:border-brand hover:shadow"
            >
              <span>
                <span className="text-lg font-semibold text-gray-800">
                  {m.name}
                </span>
                <span className="ml-3 text-gray-500">
                  {formatPhone(m.phone)}
                </span>
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                {tierLabel(m.membership_tier)}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* 태블릿에 앱으로 설치 — 이미 앱으로 실행 중이면 자동으로 숨겨진다 */}
      <div className="mt-10 border-t border-gray-200 pt-6">
        <p className="mb-3 text-center text-sm text-gray-500">
          이 태블릿에 동의서 앱을 설치하면 홈 화면에서 바로 실행할 수 있어요.
        </p>
        <div className="mx-auto max-w-sm">
          <InstallButton />
        </div>
      </div>
    </div>
  )
}
