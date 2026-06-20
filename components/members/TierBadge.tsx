import { tierLabel } from '@/lib/format'
import type { MembershipTier } from '@/types/database'

const styles: Record<MembershipTier, string> = {
  regular: 'bg-gray-100 text-gray-600',
  loyal: 'bg-blue-100 text-blue-700',
  vip: 'bg-brand-light/20 text-brand-dark',
}

export default function TierBadge({ tier }: { tier: MembershipTier }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles[tier]}`}
    >
      {tierLabel(tier)}
    </span>
  )
}
