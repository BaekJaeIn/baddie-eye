'use client'

import { useEffect } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import type { Member } from '@/types/database'
import type { MemberActionState } from '@/app/admin/(protected)/members/actions'

const initialState: MemberActionState = {}

type FormAction = (
  prev: MemberActionState,
  formData: FormData,
) => Promise<MemberActionState>

interface MemberFormProps {
  action: FormAction
  member?: Member
  // 모달에서 사용 시 성공 콜백. 없으면 기본 라우팅.
  onSuccess?: () => void
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      data-testid="member-form-submit-button"
      className="rounded-md bg-brand px-4 py-2.5 font-medium text-white transition hover:bg-brand-dark disabled:opacity-60"
    >
      {pending ? '저장 중...' : '저장'}
    </button>
  )
}

const inputClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand'
const labelClass = 'mb-1 block text-sm font-medium text-gray-700'

export default function MemberForm({
  action,
  member,
  onSuccess,
}: MemberFormProps) {
  const [state, formAction] = useFormState(action, initialState)
  const router = useRouter()

  useEffect(() => {
    if (!state.ok) return
    if (onSuccess) onSuccess()
    else router.push(member ? `/admin/members/${member.id}` : '/admin/members')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok])

  return (
    <form action={formAction} className="max-w-lg space-y-4" data-testid="member-form">
      <div>
        <label htmlFor="name" className={labelClass}>
          이름 *
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={50}
          defaultValue={member?.name}
          data-testid="member-form-name-input"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>
          연락처 *
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="010-1234-5678"
          defaultValue={member?.phone}
          data-testid="member-form-phone-input"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="birthday" className={labelClass}>
            생일
          </label>
          <input
            id="birthday"
            name="birthday"
            type="date"
            defaultValue={member?.birthday ?? ''}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="first_visit_at" className={labelClass}>
            첫 방문일
          </label>
          <input
            id="first_visit_at"
            name="first_visit_at"
            type="date"
            defaultValue={member?.first_visit_at ?? ''}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="allergy_note" className={labelClass}>
          알러지 / 주의사항
        </label>
        <textarea
          id="allergy_note"
          name="allergy_note"
          rows={3}
          maxLength={500}
          defaultValue={member?.allergy_note ?? ''}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="membership_tier" className={labelClass}>
            등급
          </label>
          <select
            id="membership_tier"
            name="membership_tier"
            defaultValue={member?.membership_tier ?? 'regular'}
            className={inputClass}
          >
            <option value="regular">일반</option>
            <option value="loyal">단골</option>
            <option value="vip">VIP</option>
          </select>
        </div>
        <div>
          <label htmlFor="points" className={labelClass}>
            포인트
          </label>
          <input
            id="points"
            name="points"
            type="number"
            min={0}
            defaultValue={member?.points ?? 0}
            className={inputClass}
          />
        </div>
      </div>

      {state.error && (
        <p
          role="alert"
          data-testid="member-form-error"
          className="text-sm text-red-600"
        >
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  )
}
