'use client'

import { useEffect, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import type { TreatmentType } from '@/types/database'
import { bookingDateBounds, toDateStr } from '@/lib/booking/slots'
import {
  requestAppointmentAction,
  type BookingActionState,
} from '@/app/(member)/booking/actions'
import SlotPicker from './SlotPicker'

const initialState: BookingActionState = {}

type FormAction = (
  prev: BookingActionState,
  formData: FormData,
) => Promise<BookingActionState>

interface BookingFormProps {
  treatments: Pick<
    TreatmentType,
    'id' | 'name' | 'duration_min' | 'base_price'
  >[]
  action?: FormAction
  defaults?: {
    treatment_type_id?: string
    date?: string
    time?: string
    memo?: string | null
  }
  submitLabel?: string
}

function SubmitButton({
  disabled,
  label,
}: {
  disabled: boolean
  label: string
}) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      data-testid="booking-submit"
      className="w-full rounded-md bg-brand px-4 py-3 font-medium text-white transition hover:bg-brand-dark disabled:opacity-50"
    >
      {pending ? '처리 중...' : label}
    </button>
  )
}

const inputClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand'
const labelClass = 'mb-1 block text-sm font-medium text-gray-700'

export default function BookingForm({
  treatments,
  action = requestAppointmentAction,
  defaults,
  submitLabel = '예약 신청',
}: BookingFormProps) {
  const [state, formAction] = useFormState(action, initialState)
  const bounds = bookingDateBounds()
  const [date, setDate] = useState(defaults?.date ?? toDateStr(new Date()))
  const [time, setTime] = useState(defaults?.time ?? '')
  const [slots, setSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetch(`/booking/slots?date=${date}`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return
        let available: string[] = d.slots ?? []
        // 변경 시: 현재 예약 슬롯(같은 날짜)이 점유로 빠지므로 다시 포함
        if (
          defaults?.date === date &&
          defaults?.time &&
          !available.includes(defaults.time)
        ) {
          available = [...available, defaults.time].sort()
        }
        setSlots(available)
      })
      .catch(() => {
        if (active) setSlots([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [date, defaults?.date, defaults?.time])

  return (
    <form action={formAction} className="space-y-5" data-testid="booking-form">
      <div>
        <label htmlFor="treatment_type_id" className={labelClass}>
          시술 종류
        </label>
        <select
          id="treatment_type_id"
          name="treatment_type_id"
          required
          defaultValue={defaults?.treatment_type_id ?? ''}
          data-testid="booking-treatment-select"
          className={inputClass}
        >
          <option value="" disabled>
            시술 선택
          </option>
          {treatments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.duration_min}분 / {t.base_price.toLocaleString()}원)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="date" className={labelClass}>
          날짜
        </label>
        <input
          id="date"
          type="date"
          value={date}
          min={bounds.min}
          max={bounds.max}
          onChange={(e) => {
            setDate(e.target.value)
            setTime('')
          }}
          data-testid="booking-date-input"
          className={inputClass}
        />
      </div>

      <div>
        <span className={labelClass}>시간</span>
        <SlotPicker
          slots={slots}
          selected={time}
          onSelect={setTime}
          loading={loading}
        />
        <input type="hidden" name="date" value={date} />
        <input type="hidden" name="time" value={time} />
      </div>

      <div>
        <label htmlFor="memo" className={labelClass}>
          요청사항 (선택)
        </label>
        <textarea
          id="memo"
          name="memo"
          rows={2}
          maxLength={500}
          defaultValue={defaults?.memo ?? ''}
          className={inputClass}
        />
      </div>

      {state.error && (
        <p
          role="alert"
          data-testid="booking-error"
          className="text-sm text-red-600"
        >
          {state.error}
        </p>
      )}

      <SubmitButton disabled={!time} label={submitLabel} />
      {action === requestAppointmentAction && (
        <p className="text-center text-xs text-gray-400">
          예약 신청 후 원장님 확인을 거쳐 확정됩니다.
        </p>
      )}
    </form>
  )
}
