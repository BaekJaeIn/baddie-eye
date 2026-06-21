import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import KakaoLoginButton from '@/components/member/KakaoLoginButton'
import InstallButton from '@/components/pwa/InstallButton'

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
        <Image
          src="/logo-admin.png"
          alt="Baddie Eye"
          width={560}
          height={121}
          className="mx-auto w-56 rounded-md"
          priority
          unoptimized
        />
        <p className="mt-2 text-sm text-gray-500">
          속눈썹연장샵 회원 마이페이지
        </p>
      </div>
      <div className="w-full space-y-4">
        <KakaoLoginButton />
        <p className="text-center text-xs text-gray-400">
          카카오 계정으로 간편하게 로그인하세요.
        </p>
        <InstallButton />
      </div>
    </main>
  )
}
