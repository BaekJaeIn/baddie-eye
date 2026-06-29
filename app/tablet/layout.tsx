import type { Metadata } from 'next'
import AccentLine from '@/components/ui/AccentLine'
import Logo from '@/components/ui/Logo'

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
    <div className="flex min-h-screen flex-col bg-cream">
      {/* 관리자 화면과 동일하게 Baddie Eye 로고를 노출한다 */}
      <header className="bg-white shadow-sm">
        <AccentLine />
        <div className="flex items-center justify-center gap-3 px-6 py-4">
          <Logo className="h-8 w-44" />
          <span className="rounded-full bg-blush/40 px-3 py-1 text-sm font-medium tracking-wide text-brand-dark">
            동의서
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 p-6">{children}</main>
    </div>
  )
}
