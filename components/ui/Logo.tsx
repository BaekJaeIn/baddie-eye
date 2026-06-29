import Link from 'next/link'

// Baddie Eye 워드마크 — 원본 PNG(logo-pink.png)를 CSS 마스크로 써서
// 원하는 브랜드 색으로 칠한다(에디토리얼 모카 톤). href가 있으면 링크로 감싼다.
interface LogoProps {
  href?: string
  className?: string // 크기 지정 (예: 'h-8 w-52')
  colorClass?: string // 색상 (배경색 유틸, 기본 모카)
  onClick?: () => void
}

const maskStyle: React.CSSProperties = {
  WebkitMaskImage: 'url(/logo-pink.png)',
  maskImage: 'url(/logo-pink.png)',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center',
  maskPosition: 'center',
  WebkitMaskSize: 'contain',
  maskSize: 'contain',
}

export default function Logo({
  href,
  className = 'h-8 w-52',
  colorClass = 'bg-brand-dark',
  onClick,
}: LogoProps) {
  // 링크로 감쌀 때는 크기(className)를 링크에 주고, 마스크 span은 부모를 채운다.
  // (inline 요소가 자식의 w-full을 만나 0으로 붕괴하는 문제 방지)
  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        aria-label="Baddie Eye"
        className={`block transition hover:opacity-80 ${className}`}
      >
        <span
          aria-hidden
          className={`block h-full w-full ${colorClass}`}
          style={maskStyle}
        />
      </Link>
    )
  }

  return (
    <span
      role="img"
      aria-label="Baddie Eye"
      className={`block ${colorClass} ${className}`}
      style={maskStyle}
    />
  )
}
