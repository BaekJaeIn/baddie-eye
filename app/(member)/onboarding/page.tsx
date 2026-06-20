import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OnboardingForm from '@/components/member/OnboardingForm'

export default async function OnboardingPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 이미 연결됐으면 마이페이지로
  const { data: member } = await supabase
    .from('members')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (member) redirect('/me')

  return (
    <main className="flex min-h-screen flex-col justify-center px-6">
      <div className="mb-8 text-center">
        <h1 className="text-xl font-bold text-gray-800">회원 연결</h1>
        <p className="mt-2 text-sm text-gray-500">
          마이페이지를 이용하려면 연락처를 확인해주세요.
        </p>
      </div>
      <OnboardingForm />
    </main>
  )
}
