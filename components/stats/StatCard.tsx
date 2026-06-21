export default function StatCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <div
      data-testid="stat-card"
      className="rounded-lg bg-white p-4 shadow-sm"
    >
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 break-words text-xl font-bold tabular-nums text-gray-800 md:text-2xl">
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  )
}
