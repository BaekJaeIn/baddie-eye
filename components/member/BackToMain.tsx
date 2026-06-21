'use client'

import { useRouter } from 'next/navigation'

/**
 * 마이페이지(/me)로 돌아가는 화면 내 버튼.
 *
 * router.push로 마이페이지로 이동한다. (router.back은 popstate를 발생시켜
 * 설치 앱의 "뒤로가기 두 번 종료" 가드(BackExitGuard)와 충돌하므로 사용하지 않음.
 * 하드웨어 뒤로가기는 BackExitGuard가 전담한다.)
 */
export default function BackToMain({
  label = '← 마이페이지',
  className = 'text-sm text-gray-400 hover:text-gray-600',
}: {
  label?: string
  className?: string
}) {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.push('/me')}
      className={className}
    >
      {label}
    </button>
  )
}
