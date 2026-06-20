'use client'

import { useFormState, useFormStatus } from 'react-dom'
import {
  connectMemberAction,
  type OnboardingActionState,
} from '@/app/(member)/onboarding/actions'

const initialState: OnboardingActionState = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      data-testid="onboarding-submit"
      className="w-full rounded-md bg-brand px-4 py-3 font-medium text-white transition hover:bg-brand-dark disabled:opacity-60"
    >
      {pending ? '연결 중...' : '확인'}
    </button>
  )
}

export default function OnboardingForm() {
  const [state, formAction] = useFormState(connectMemberAction, initialState)

  return (
    <form action={formAction} className="space-y-4" data-testid="onboarding-form">
      <div>
        <label
          htmlFor="phone"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          연락처
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="010-1234-5678"
          data-testid="onboarding-phone-input"
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <p className="mt-1 text-xs text-gray-400">
          샵에 등록하신 연락처를 입력해주세요.
        </p>
      </div>

      {state.error && (
        <p
          role="alert"
          data-testid="onboarding-error"
          className="text-sm text-red-600"
        >
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  )
}
