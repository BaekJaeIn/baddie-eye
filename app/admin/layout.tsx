import type { Metadata } from 'next'

// 관리자 영역(/admin/*)은 회원 앱과 분리된 "관리자용 앱"으로 설치되도록
// 별도 매니페스트를 advertise 한다. 브라우저 탭 제목은 루트와 동일하게 유지하고
// (통일), 설치 앱 이름만 "관리자"로 구분한다.
export const metadata: Metadata = {
  manifest: '/manifest-admin.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Baddie Eye 관리자',
  },
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
