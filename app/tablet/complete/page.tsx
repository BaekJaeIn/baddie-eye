import Link from 'next/link'

interface CompletePageProps {
  searchParams: { agreed?: string }
}

// 태블릿 동의서 — 3단계: 완료 화면. 다음 고객을 위해 처음으로 돌아간다.
export default function CompletePage({ searchParams }: CompletePageProps) {
  const agreed = searchParams.agreed === '1'

  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div
        className={`flex h-24 w-24 items-center justify-center rounded-full text-5xl ${
          agreed ? 'bg-brand/10 text-brand' : 'bg-gray-100 text-gray-400'
        }`}
      >
        {agreed ? '✓' : '✕'}
      </div>

      <h2 className="mt-6 text-2xl font-semibold text-gray-800">
        {agreed ? '동의가 완료되었습니다' : '동의하지 않음으로 기록되었습니다'}
      </h2>
      <p className="mt-2 text-gray-500">
        {agreed
          ? '소중한 동의 감사합니다. 편안한 시술 받으세요.'
          : '동의 거부가 기록되었습니다. 자세한 내용은 직원에게 문의해 주세요.'}
      </p>

      <Link
        href="/tablet"
        className="mt-10 rounded-xl bg-brand px-10 py-4 text-lg font-semibold text-white hover:bg-brand-dark"
      >
        다음 고객
      </Link>
    </div>
  )
}
