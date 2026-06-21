'use client'

import { useRouter } from 'next/navigation'

/**
 * 마이페이지(/me)로 돌아가는 버튼.
 *
 * <Link href="/me">는 history에 새 항목을 push 해서 뒤로가기 스택이 쌓인다.
 * 대신 가능한 경우 router.back()으로 스택을 pop 한다. 그러면 마이페이지가
 * 루트가 되어, 마이페이지에서 뒤로가기 시 바로 앱이 종료된다.
 *
 * 딥링크/푸시 알림 등으로 이전 기록 없이 바로 진입한 경우(history.length<=1)는
 * 되돌아갈 곳이 없으므로 /me로 이동한다.
 */
export default function BackToMain({
  label = '← 마이페이지',
  className = 'text-sm text-gray-400 hover:text-gray-600',
}: {
  label?: string
  className?: string
}) {
  const router = useRouter()

  function handleClick() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/me')
    }
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {label}
    </button>
  )
}
