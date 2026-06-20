import { redirect } from 'next/navigation'

// 루트 진입 시 Admin 로그인으로. Member 영역은 Bolt 4에서 추가.
export default function Home() {
  redirect('/admin/login')
}
