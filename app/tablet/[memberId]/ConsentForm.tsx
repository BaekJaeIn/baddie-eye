'use client'

import { useState, useTransition } from 'react'
import { submitConsentAction } from './actions'

// 동의/거부 버튼 + 확인 체크박스. 동의는 체크 후에만 활성화된다.
export default function ConsentForm({ memberId }: { memberId: string }) {
  const [checked, setChecked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submit(agreed: boolean) {
    setError(null)
    startTransition(async () => {
      const result = await submitConsentAction(memberId, agreed)
      // 성공 시 action 내부에서 redirect 되므로 여기 도달하지 않는다.
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="mt-6">
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="h-6 w-6 accent-brand"
          data-testid="consent-checkbox"
        />
        <span className="text-lg text-gray-800">
          위 내용을 모두 읽고 이해하였으며, 시술 및 개인정보 수집·이용에
          동의합니다.
        </span>
      </label>

      {error && (
        <p className="mt-3 text-center text-red-600" data-testid="consent-error">
          {error}
        </p>
      )}

      <div className="mt-6 flex gap-4">
        <button
          type="button"
          onClick={() => submit(false)}
          disabled={pending}
          className="flex-1 rounded-xl border border-gray-300 bg-white py-5 text-lg font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          data-testid="consent-decline"
        >
          동의하지 않음
        </button>
        <button
          type="button"
          onClick={() => submit(true)}
          disabled={!checked || pending}
          className="flex-[2] rounded-xl bg-brand py-5 text-lg font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
          data-testid="consent-agree"
        >
          {pending ? '처리 중…' : '동의합니다'}
        </button>
      </div>
    </div>
  )
}
