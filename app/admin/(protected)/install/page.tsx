import InstallQR from '@/components/pwa/InstallQR'
import { AppleIcon, AndroidIcon } from '@/components/icons/PlatformIcons'

export const metadata = {
  title: '앱 설치 안내',
}

export default function InstallGuidePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">회원 앱 설치 안내</h1>
        <p className="mt-1 text-sm text-gray-500">
          아래 QR 코드를 회원에게 보여주세요. 휴대폰 카메라로 스캔하면 회원용
          앱으로 바로 연결되고, 홈 화면에 앱으로 설치할 수 있습니다.
        </p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <InstallQR />
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-800">설치 방법</h2>
        <div className="space-y-4 text-sm leading-relaxed text-gray-600">
          <div>
            <p className="flex items-center gap-1.5 font-medium text-gray-700">
              <AppleIcon className="h-4 w-4" /> 아이폰 (Safari)
            </p>
            <p className="mt-1">
              QR 스캔 → 하단 <b>공유 버튼</b>(□↑) → <b>&quot;홈 화면에 추가&quot;</b>{' '}
              선택
            </p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 font-medium text-gray-700">
              <AndroidIcon className="h-4 w-4" /> 안드로이드 (Chrome)
            </p>
            <p className="mt-1">
              QR 스캔 → 화면에 뜨는 <b>&quot;홈 화면에 앱 설치하기&quot;</b> 버튼
              또는 우측 상단 메뉴 → <b>&quot;앱 설치&quot;</b> 선택
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
