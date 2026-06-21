export interface NavItem {
  label: string
  href: string
}

// 관리자 좌측/모바일 메뉴 공통 목록. 구현된 메뉴만 점진적 추가.
export const navItems: NavItem[] = [
  { label: '대시보드', href: '/admin/dashboard' },
  { label: '회원 관리', href: '/admin/members' }, // Bolt 2
  { label: '예약 관리', href: '/admin/appointments' }, // Bolt 3
  { label: '시술 종류', href: '/admin/treatments' }, // Bolt 3
  { label: '시술 내역', href: '/admin/visits' }, // Bolt 3.5
  { label: '통계', href: '/admin/stats' }, // Bolt 7
  { label: '앱 설치 안내', href: '/admin/install' }, // QR 안내
]
