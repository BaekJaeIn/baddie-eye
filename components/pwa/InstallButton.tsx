'use client'

import { useEffect, useState } from 'react'
import { AppleIcon, AndroidIcon } from '@/components/icons/PlatformIcons'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// 설치된 앱(홈 화면 실행)으로 떠 있는지 판별.
// display-mode: standalone | fullscreen | minimal-ui 모두 "앱 모드"로 간주.
function detectStandalone() {
  if (typeof window === 'undefined') return false
  const displayModeApp =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches
  const iosStandalone =
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  return displayModeApp || iosStandalone
}

// 메신저 등 인앱 브라우저인지 — 이 경우 beforeinstallprompt가 오지 않아
// 네이티브 설치가 불가능하므로, 외부 브라우저로 열도록 유도해야 한다.
function detectInApp(ua: string): boolean {
  return /KAKAOTALK|NAVER|DaumApps|Instagram|FBAN|FBAV|FB_IAB|Line\/|Snapchat|; wv\)/i.test(
    ua,
  )
}

// 현재 페이지를 안드로이드 Chrome에서 강제로 열기 (intent URL).
// Chrome이 없으면 fallback_url로 원래 주소를 연다.
function openInChrome() {
  const href = window.location.href
  const noScheme = href.replace(/^https?:\/\//, '')
  const intentUrl =
    `intent://${noScheme}#Intent;scheme=https;package=com.android.chrome;` +
    `S.browser_fallback_url=${encodeURIComponent(href)};end`
  window.location.href = intentUrl
}

export default function InstallButton() {
  const [mounted, setMounted] = useState(false)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  )
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [inApp, setInApp] = useState(false)
  const [standalone, setStandalone] = useState(true) // 판별 전엔 숨김(앱에서 깜빡임 방지)
  const [showIosHelp, setShowIosHelp] = useState(false)
  const [showManualHelp, setShowManualHelp] = useState(false)

  useEffect(() => {
    setMounted(true)
    setStandalone(detectStandalone())

    const ua = window.navigator.userAgent
    setIsIOS(/iPad|iPhone|iPod/.test(ua))
    setIsAndroid(/Android/i.test(ua))
    setInApp(detectInApp(ua))

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    const onInstalled = () => {
      setDeferred(null)
      setStandalone(true)
    }
    window.addEventListener('appinstalled', onInstalled)

    // 앱<->브라우저 전환(설치 직후 등) 대비해 display-mode 변화도 감지
    const mql = window.matchMedia('(display-mode: standalone)')
    const onModeChange = () => setStandalone(detectStandalone())
    mql.addEventListener?.('change', onModeChange)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', onInstalled)
      mql.removeEventListener?.('change', onModeChange)
    }
  }, [])

  // 클라이언트 판별 완료 전 또는 이미 설치된 앱 모드면 표시 안 함
  if (!mounted || standalone) return null

  // 메신저 인앱 브라우저: 설치가 불가하므로 외부 브라우저로 유도
  if (inApp) {
    // 안드로이드 → Chrome으로 바로 열기
    if (isAndroid) {
      return (
        <div data-testid="install-inapp-android">
          <button
            onClick={openInChrome}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-brand px-4 py-3 font-medium text-brand transition hover:bg-brand-light/10"
          >
            <AndroidIcon className="h-4 w-4" />
            Chrome으로 열어서 설치하기
          </button>
          <p className="mt-2 rounded-md bg-gray-50 p-3 text-xs leading-relaxed text-gray-600">
            앱 설치는 Chrome에서만 가능해요. 위 버튼을 누르면 Chrome으로 열립니다.
            (안 열리면 우측 상단 <b>⋮ 메뉴 → &quot;다른 브라우저로 열기&quot;</b>)
          </p>
        </div>
      )
    }
    // 아이폰 인앱 브라우저 → Safari로 열도록 안내 (강제 불가)
    return (
      <div
        data-testid="install-inapp-ios"
        className="rounded-md bg-gray-50 p-3 text-xs leading-relaxed text-gray-600"
      >
        <p className="mb-1 flex items-center gap-1.5 font-medium text-gray-700">
          <AppleIcon className="h-4 w-4" /> 앱 설치는 Safari에서 가능해요
        </p>
        우측 하단/상단 메뉴에서 <b>&quot;Safari로 열기&quot;</b>를 누른 뒤,
        하단 <b>공유 버튼</b>(□↑) → <b>&quot;홈 화면에 추가&quot;</b>를 선택하세요.
      </div>
    )
  }

  // Android 등: 네이티브 설치 프롬프트 사용
  if (deferred) {
    return (
      <button
        onClick={async () => {
          await deferred.prompt()
          await deferred.userChoice
          setDeferred(null)
        }}
        data-testid="install-button"
        className="flex w-full items-center justify-center gap-2 rounded-md border border-brand px-4 py-3 font-medium text-brand transition hover:bg-brand-light/10"
      >
        <AndroidIcon className="h-4 w-4" />
        홈 화면에 앱 설치하기
      </button>
    )
  }

  // iOS Safari: 자동 설치 불가 → 안내
  if (isIOS) {
    return (
      <div data-testid="install-ios">
        <button
          onClick={() => setShowIosHelp((v) => !v)}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-brand px-4 py-3 font-medium text-brand transition hover:bg-brand-light/10"
        >
          <AppleIcon className="h-4 w-4" />
          앱으로 설치하는 법
        </button>
        {showIosHelp && (
          <p className="mt-2 rounded-md bg-gray-50 p-3 text-xs leading-relaxed text-gray-600">
            아이폰: 하단 <b>공유 버튼</b>(□↑) → <b>&quot;홈 화면에 추가&quot;</b>
            를 누르면 앱처럼 설치됩니다.
          </p>
        )}
      </div>
    )
  }

  // 그 외(안드로이드 Chrome 등에서 beforeinstallprompt가 아직/안 뜬 경우):
  // 네이티브 프롬프트 없이도 수동 설치 방법을 안내한다.
  return (
    <div data-testid="install-manual">
      <button
        onClick={() => setShowManualHelp((v) => !v)}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-brand px-4 py-3 font-medium text-brand transition hover:bg-brand-light/10"
      >
        <AndroidIcon className="h-4 w-4" />
        앱으로 설치하는 법
      </button>
      {showManualHelp && (
        <p className="mt-2 rounded-md bg-gray-50 p-3 text-xs leading-relaxed text-gray-600">
          안드로이드(Chrome): 우측 상단 <b>⋮ 메뉴</b> →{' '}
          <b>&quot;앱 설치&quot;</b> 또는 <b>&quot;홈 화면에 추가&quot;</b>를
          누르면 앱처럼 설치됩니다.
          <br />
          삼성 인터넷: 하단/상단 <b>메뉴</b> →{' '}
          <b>&quot;현재 페이지 추가&quot; → &quot;홈 화면&quot;</b>.
        </p>
      )}
    </div>
  )
}
