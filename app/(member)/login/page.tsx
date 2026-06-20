import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import KakaoLoginButton from '@/components/member/KakaoLoginButton'

export default async function MemberLoginPage() {
  // 이미 로그인했으면 마이페이지로
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect('/me')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-brand">Baddie Eye</h1>
        <p className="mt-2 text-sm text-gray-500">
          속눈썹연장샵 회원 마이페이지
        </p>
      </div>
      <div className="w-full">
        <KakaoLoginButton />
        <p className="mt-4 text-center text-xs text-gray-400">
          카카오 계정으로 간편하게 로그인하세요.
        </p>
      </div>
    </main>
  )
}
