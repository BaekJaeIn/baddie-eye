import BackExitGuard from '@/components/pwa/BackExitGuard'

// 고객(Member) 영역 셸 — 모바일 우선.
export default function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-white">
      {children}
      <BackExitGuard />
    </div>
  )
}
