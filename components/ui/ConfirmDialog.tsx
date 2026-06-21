'use client'

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'
import Modal from './Modal'

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  // 삭제 등 위험 동작이면 확인 버튼을 빨간색으로
  destructive?: boolean
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

// 네이티브 confirm() 대체 — await confirm({ message }) 형태로 사용
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext)
  if (!ctx) {
    throw new Error('useConfirm은 ConfirmProvider 안에서만 사용할 수 있습니다.')
  }
  return ctx
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts)
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  const settle = useCallback((result: boolean) => {
    resolverRef.current?.(result)
    resolverRef.current = null
    setOptions(null)
  }, [])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={options !== null}
        onClose={() => settle(false)}
        title={options?.title ?? '확인'}
      >
        {options && (
          <div className="space-y-5" data-testid="confirm-dialog">
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
              {options.message}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => settle(false)}
                data-testid="confirm-cancel"
                className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
              >
                {options.cancelText ?? '취소'}
              </button>
              <button
                type="button"
                onClick={() => settle(true)}
                data-testid="confirm-ok"
                autoFocus
                className={
                  options.destructive
                    ? 'rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700'
                    : 'rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark'
                }
              >
                {options.confirmText ?? '확인'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </ConfirmContext.Provider>
  )
}
