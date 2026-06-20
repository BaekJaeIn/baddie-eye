'use client'

import { useEffect } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { generateSlots } from '@/lib/booking/slots'
import type { Member, TreatmentType } from '@/types/database'
import type { AppointmentActionState } from '@/app/admin/(protected)/appointments/actions'

const initialState: AppointmentActionState = {}

type FormAction = (
  prev: AppointmentActionState,
  formData: FormData,
) => Promise<AppointmentActionState>

interface AppointmentFormProps {
  action: FormAction
  members: Pick<Member, 'id' | 'name'>[]
  treatments: Pick<TreatmentType, 'id' | 'name'>[]
  defaults?: {
    member_id?: string
    treatment_type_id?: string
    date?: string
    time?: string
    memo?: string | null
  }
  onSuccess?: () => void
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      data-testid="appointment-form-submit-button"
      className="rounded-md bg-brand px-4 py-2.5 font-medium text-white transition hover:bg-brand-dark disabled:opacity-60"
    >
      {pending ? '저장 중...' : '저장'}
    </button>
  )
}

const inputClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand'
const labelClass = 'mb-1 block text-sm font-medium text-gray-700'

export default function AppointmentForm({
  action,
  members,
  treatments,
  defaults,
  onSuccess,
}: AppointmentFormProps) {
  const [state, formAction] = useFormState(action, initialState)
  const router = useRouter()
  const slots = generateSlots()

  useEffect(() => {
    if (!state.ok) return
    if (onSuccess) onSuccess()
    else router.push('/admin/appointments')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok])

  return (
    <form
      action={formAction}
      className="max-w-lg space-y-4"
      data-testid="appointment-form"
    >
      <div>
        <label htmlFor="member_id" className={labelClass}>
          회원 *
        </label>
        <select
          id="member_id"
          name="member_id"
          required
          defaultValue={defaults?.member_id ?? ''}
          data-testid="appointment-form-member-select"
          className={inputClass}
        >
          <option value="" disabled>
            회원 선택
          </option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="treatment_type_id" className={labelClass}>
          시술 종류 *
        </label>
        <select
          id="treatment_type_id"
          name="treatment_type_id"
          required
          defaultValue={defaults?.treatment_type_id ?? ''}
          data-testid="appointment-form-treatment-select"
          className={inputClass}
        >
          <option value="" disabled>
            시술 선택
          </option>
          {treatments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className={labelClass}>
            날짜 *
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={defaults?.date}
            data-testid="appointment-form-date-input"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="time" className={labelClass}>
            시간 *
          </label>
          <select
            id="time"
            name="time"
            required
            defaultValue={defaults?.time ?? ''}
            data-testid="appointment-form-time-select"
            className={inputClass}
          >
            <option value="" disabled>
              시간 선택
            </option>
            {slots.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="memo" className={labelClass}>
          메모
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
          data-testid="appointment-form-error"
          className="text-sm text-red-600"
        >
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  )
}
