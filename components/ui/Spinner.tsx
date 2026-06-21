// 공통 로딩 스피너 (라이브러리 없이 Tailwind 애니메이션)
export default function Spinner({
  label = '불러오는 중...',
  className = '',
}: {
  label?: string
  className?: string
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-16 ${className}`}
      role="status"
      aria-live="polite"
      data-testid="spinner"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-brand" />
      <span className="text-sm text-gray-400">{label}</span>
    </div>
  )
}
