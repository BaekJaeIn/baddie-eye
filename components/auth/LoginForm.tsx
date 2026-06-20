'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { loginAction, type LoginActionState } from '@/app/admin/login/actions'

const initialState: LoginActionState = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      data-testid="login-form-submit-button"
      className="w-full rounded-md bg-brand px-4 py-2.5 font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? '로그인 중...' : '로그인'}
    </button>
  )
}

export default function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState)

  return (
    <form action={formAction} className="space-y-4" data-testid="login-form">
      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          data-testid="login-form-email-input"
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="current-password"
          data-testid="login-form-password-input"
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      {state.error && (
        <p
          role="alert"
          data-testid="login-form-error"
          className="text-sm text-red-600"
        >
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  )
}
