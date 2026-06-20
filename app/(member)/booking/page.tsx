import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { TreatmentType } from '@/types/database'
import BookingForm from '@/components/booking/BookingForm'

export default async function BookingPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 연결 확인
  const { data: member } = await supabase
    .from('members')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!member) redirect('/onboarding')

  const { data: treatmentData } = await supabase
    .from('treatment_types')
    .select('id, name, duration_min, base_price')
    .order('name')

  const treatments = (treatmentData ?? []) as Pick<
    TreatmentType,
    'id' | 'name' | 'duration_min' | 'base_price'
  >[]

  return (
    <div className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/me" className="text-sm text-gray-400 hover:text-gray-600">
          ← 마이페이지
        </Link>
      </div>
      <h1 className="mb-6 text-xl font-bold text-gray-800">예약 신청</h1>

      {treatments.length === 0 ? (
        <p className="text-sm text-gray-500">
          현재 예약 가능한 시술이 없습니다. 샵에 문의해주세요.
        </p>
      ) : (
        <BookingForm treatments={treatments} />
      )}
    </div>
  )
}
