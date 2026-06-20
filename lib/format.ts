// 전화번호 정규화/포맷 유틸

// 입력값에서 숫자만 추출 (저장 전 정규화)
export function normalizePhone(input: string): string {
  return input.replace(/\D/g, '')
}

// 숫자 전화번호를 표시용으로 포맷 (010-1234-5678)
export function formatPhone(phone: string): string {
  const digits = normalizePhone(phone)
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone
}

// 멤버십 등급 한글 라벨
export function tierLabel(tier: string): string {
  switch (tier) {
    case 'regular':
      return '일반'
    case 'loyal':
      return '단골'
    case 'vip':
      return 'VIP'
    default:
      return tier
  }
}
