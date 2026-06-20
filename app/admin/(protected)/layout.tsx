import AdminLayout from '@/components/admin/AdminLayout'

// 보호된 Admin 영역. 인증 강제는 middleware.ts에서 처리.
// 이 그룹 밖에 있는 /admin/login은 셸 없이 렌더된다.
export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayout>{children}</AdminLayout>
}
