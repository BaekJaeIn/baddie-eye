import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '동의서 — Baddie Eye',
  // 태블릿 전용 PWA manifest — 설치 시 /tablet 으로 바로 실행된다.
  manifest: '/tablet-manifest.json',
}

// 태블릿 키오스크 셸 — 관리자 사이드바 없이 전체 화면.
// 매장 태블릿에서 회원이 규약을 읽고 동의하는 전용 화면.
export default function TabletLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="bg-brand px-6 py-4 text-white shadow-sm">
        <h1 className="text-center text-xl font-semibold tracking-tight">
          Baddie Eye · 동의서
        </h1>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 p-6">{children}</main>
    </div>
  )
}
