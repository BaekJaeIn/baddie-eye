'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

// 설치된 앱(standalone)인지 — 일반 브라우저 탭에서는 뒤로가기를 가로채지 않는다.
function isStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

/**
 * 설치된 앱에서 "뒤로가기 두 번으로 종료" 패턴.
 *
 *  - 뒤로가기 1번: "한 번 더 누르면 종료됩니다" 안내 + 현재 화면 유지(센티넬 재설치)
 *  - 2초 안에 1번 더: 앱을 종료한다.
 *
 * 종료는 히스토리 깊이와 무관하게, 세션의 첫 항목까지 한 번에 되돌아간 뒤
 * 한 번 더 뒤로가기를 호출해 앱을 닫는다. (앱 안에서 여러 화면을 이동해
 * 히스토리가 쌓여 있어도 확실히 종료되도록.)
 *
 * 일반 브라우저 탭에서는 동작하지 않는다(탭은 스크립트로 닫을 수 없고,
 * 뒤로가기를 가로채면 오히려 불편하기 때문).
 */
export default function BackExitGuard() {
  const pathname = usePathname()
  const [showToast, setShowToast] = useState(false)
  const armedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isStandalone()) return

    // 세션 첫 항목까지 되돌아간 뒤 한 번 더 뒤로가기 → 앱 종료
    function exitApp() {
      const total = window.history.length
      if (total <= 1) {
        window.history.back()
        return
      }
      let reached = false
      const onBase = () => {
        reached = true
        window.removeEventListener('popstate', onBase)
        window.history.back() // 첫 항목에서 한 번 더 → 종료
      }
      window.addEventListener('popstate', onBase)
      // 현재 위치에서 첫 항목(index 0)까지 이동 (범위를 넘으면 0으로 clamp)
      window.history.go(-(total - 1))
      // 이미 첫 항목이라 이동이 없으면 popstate가 안 뜨므로 직접 종료
      window.setTimeout(() => {
        if (!reached) {
          window.removeEventListener('popstate', onBase)
          window.history.back()
        }
      }, 100)
    }

    function onPopState() {
      if (armedRef.current) {
        // 2번째 → 앱 종료
        armedRef.current = false
        if (timerRef.current) clearTimeout(timerRef.current)
        setShowToast(false)
        window.removeEventListener('popstate', onPopState)
        exitApp()
        return
      }
      // 1번째 → 종료 안내 + 가드 재설치(현재 화면 유지)
      armedRef.current = true
      setShowToast(true)
      timerRef.current = setTimeout(() => {
        armedRef.current = false
        setShowToast(false)
      }, 2000)
      window.history.pushState({ __backGuard: true }, '')
    }

    // 최초 가드(센티넬) 설치
    window.history.pushState({ __backGuard: true }, '')
    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('popstate', onPopState)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // 페이지 이동(링크 push)으로 센티넬이 묻히면, 새 화면 위에 다시 올려
  // 다음 뒤로가기를 가로챌 수 있게 한다.
  useEffect(() => {
    if (!isStandalone()) return
    if (!window.history.state?.__backGuard) {
      window.history.pushState({ __backGuard: true }, '')
    }
  }, [pathname])

  if (!showToast) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4">
      <div className="rounded-full bg-gray-900/90 px-4 py-2 text-sm text-white shadow-lg">
        한 번 더 누르면 앱이 종료됩니다
      </div>
    </div>
  )
}
