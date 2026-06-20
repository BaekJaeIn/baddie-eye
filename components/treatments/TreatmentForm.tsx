'use client'

import { useEffect } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import type { TreatmentType } from '@/types/database'
import type { TreatmentActionState } from '@/app/admin/(protected)/treatments/actions'

const initialState: TreatmentActionState = {}

type FormAction = (
  prev: TreatmentActionState,
  formData: FormData,
) => Promise<TreatmentActionState>

interface TreatmentFormProps {
  action: FormAction
  treatment?: TreatmentType
  onSuccess?: () => void
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      data-testid="treatment-form-submit-button"
      className="rounded-md bg-brand px-4 py-2.5 font-medium text-white transition hover:bg-brand-dark disabled:opacity-60"
    >
      {pending ? '저장 중...' : '저장'}
    </button>
  )
}

const inputClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand'
const labelClass = 'mb-1 block text-sm font-medium text-gray-700'

export default function TreatmentForm({
  action,
  treatment,
  onSuccess,
}: TreatmentFormProps) {
  const [state, formAction] = useFormState(action, initialState)
  const router = useRouter()

  useEffect(() => {
    if (!state.ok) return
    if (onSuccess) onSuccess()
    else router.push('/admin/treatments')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok])

  return (
    <form
      action={formAction}
      className="max-w-lg space-y-4"
      data-testid="treatment-form"
    >
      <div>
        <label htmlFor="name" className={labelClass}>
          시술명 *
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={50}
          defaultValue={treatment?.name}
          placeholder="예: 자연눈썹 1set"
          data-testid="treatment-form-name-input"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="duration_min" className={labelClass}>
            소요시간 (분) *
          </label>
          <input
            id="duration_min"
            name="duration_min"
            type="number"
            min={1}
            required
            defaultValue={treatment?.duration_min}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="base_price" className={labelClass}>
            기본가격 (원) *
          </label>
          <input
            id="base_price"
            name="base_price"
            type="number"
            min={0}
            required
            defaultValue={treatment?.base_price}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="recommended_interval_days" className={labelClass}>
          권장 재방문 주기 (일)
        </label>
        <input
          id="recommended_interval_days"
          name="recommended_interval_days"
          type="number"
          min={1}
          defaultValue={treatment?.recommended_interval_days ?? ''}
          placeholder="예: 21 (3주). 비워두면 미설정"
          className={inputClass}
        />
      </div>

      {state.error && (
        <p
          role="alert"
          data-testid="treatment-form-error"
          className="text-sm text-red-600"
        >
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  )
}
