'use client'

export interface Slot {
  time: string
  available: boolean
}

interface SlotPickerProps {
  slots: Slot[]
  selected: string
  onSelect: (time: string) => void
  loading: boolean
}

export default function SlotPicker({
  slots,
  selected,
  onSelect,
  loading,
}: SlotPickerProps) {
  if (loading) {
    return <p className="py-4 text-sm text-gray-400">시간을 불러오는 중...</p>
  }
  if (slots.length === 0) {
    return (
      <p className="py-4 text-sm text-gray-400" data-testid="no-slots">
        예약 가능한 시간이 없습니다.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-2" data-testid="slot-picker">
      {slots.map((s) => {
        const isSelected = selected === s.time
        const disabled = !s.available
        return (
          <button
            key={s.time}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(s.time)}
            data-testid={`booking-slot-${s.time}`}
            className={
              isSelected
                ? 'rounded-md bg-brand px-2 py-2 text-sm text-white'
                : disabled
                  ? 'cursor-not-allowed rounded-md border border-gray-100 bg-gray-50 px-2 py-2 text-sm text-gray-300'
                  : 'rounded-md border border-gray-200 px-2 py-2 text-sm text-gray-700 hover:border-brand'
            }
          >
            {s.time}
          </button>
        )
      })}
    </div>
  )
}
