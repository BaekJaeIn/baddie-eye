// 에디토리얼 악센트 — 뮤트 톤(블러시→토프→모카)의 얇은 헤어라인.
// 헤더/사이드바 상단에 절제된 포인트로 사용한다.
export default function AccentLine({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-0.5 w-full bg-gradient-to-r from-blush via-taupe to-brand-light ${className}`}
      aria-hidden
    />
  )
}
