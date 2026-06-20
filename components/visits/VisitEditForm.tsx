'use client'

import { useFormState, useFormStatus } from 'react-dom'
import PhotoUploader from './PhotoUploader'
import type { VisitHistory } from '@/types/database'
import type { VisitActionState } from '@/app/admin/(protected)/visits/actions'

const initialState: VisitActionState = {}

type FormAction = (
  prev: VisitActionState,
  formData: FormData,
) => Promise<VisitActionState>

interface VisitEditFormProps {
  action: FormAction
  visit: VisitHistory
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      data-testid="visit-edit-submit"
      className="rounded-md bg-brand px-4 py-2.5 font-medium text-white transition hover:bg-brand-dark disabled:opacity-60"
    >
      {pending ? '저장 중...' : '저장'}
    </button>
  )
}

const inputClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand'
const labelClass = 'mb-1 block text-sm font-medium text-gray-700'

// 'YYYY-MM-DDTHH:mm:ssZ' → datetime-local 'YYYY-MM-DDTHH:mm'
function toLocalInput(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function VisitEditForm({ action, visit }: VisitEditFormProps) {
  const [state, formAction] = useFormState(action, initialState)

  return (
    <form
      action={formAction}
      className="max-w-lg space-y-4"
      data-testid="visit-edit-form"
    >
      <div>
        <label htmlFor="price_paid" className={labelClass}>
          결제금액 (원) *
        </label>
        <input
          id="price_paid"
          name="price_paid"
          type="number"
          min={0}
          required
          defaultValue={visit.price_paid}
          data-testid="visit-price-input"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="visited_at" className={labelClass}>
          방문 일시 *
        </label>
        <input
          id="visited_at"
          name="visited_at"
          type="datetime-local"
          required
          defaultValue={toLocalInput(visit.visited_at)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>시술 사진 (before/after)</label>
        <PhotoUploader
          memberId={visit.member_id}
          visitId={visit.id}
          initialUrl={visit.before_after_photo_url}
          name="before_after_photo_url"
        />
      </div>

      {state.error && (
        <p
          role="alert"
          data-testid="visit-edit-error"
          className="text-sm text-red-600"
        >
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  )
}
