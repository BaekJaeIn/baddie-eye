import InstallQR from '@/components/pwa/InstallQR'
import { AppleIcon, AndroidIcon } from '@/components/icons/PlatformIcons'

export default function InstallGuidePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">태블릿 동의서 앱 설치 안내</h1>
        <p className="mt-1 text-sm text-gray-500">
          매장 태블릿의 카메라로 아래 QR을 스캔하면 동의서 화면(<code>/tablet</code>)으로
          연결됩니다. 관리자 로그인 후, 화면 하단의 <b>앱 설치</b> 버튼으로 홈 화면에
          설치하면 앱처럼 실행할 수 있습니다.
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
              <AppleIcon className="h-4 w-4" /> 아이패드 (Safari)
            </p>
            <p className="mt-1">
              로그인 후 <b>공유 버튼</b>(□↑) → <b>&quot;홈 화면에 추가&quot;</b>{' '}
              선택
            </p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 font-medium text-gray-700">
              <AndroidIcon className="h-4 w-4" /> 안드로이드 태블릿 (Chrome)
            </p>
            <p className="mt-1">
              로그인 후 화면 하단의 <b>&quot;홈 화면에 앱 설치하기&quot;</b> 버튼
              또는 우측 상단 메뉴 → <b>&quot;앱 설치&quot;</b> 선택
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
