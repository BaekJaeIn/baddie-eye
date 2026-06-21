'use client'

import { useState } from 'react'
import Image from 'next/image'
import Modal from '@/components/ui/Modal'

export interface MyVisitItem {
  id: string
  visited_at: string
  treatment_name: string
  price_paid: number
  before_after_photo_url: string | null
}

// 고객용 시술 히스토리 — 항목 클릭 시 상세 모달
export default function MyVisitHistory({ visits }: { visits: MyVisitItem[] }) {
  const [selected, setSelected] = useState<MyVisitItem | null>(null)

  if (visits.length === 0) {
    return (
      <p
        className="py-6 text-center text-sm text-gray-400"
        data-testid="my-visit-empty"
      >
        아직 시술 내역이 없습니다.
      </p>
    )
  }

  return (
    <>
      <ul className="space-y-3" data-testid="my-visit-list">
        {visits.map((v) => (
          <li key={v.id}>
            <button
              type="button"
              onClick={() => setSelected(v)}
              data-testid="my-visit-item"
              className="flex w-full items-center gap-3 rounded-lg border border-gray-100 p-3 text-left transition hover:border-brand/40 hover:bg-brand-light/5"
            >
              {v.before_after_photo_url ? (
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={v.before_after_photo_url}
                    alt={v.treatment_name}
                    fill
                    sizes="56px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-gray-50 text-xs text-gray-300">
                  사진
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {v.treatment_name}
                </p>
                <p className="text-xs text-gray-400">
                  {v.visited_at.slice(0, 10)}
                </p>
              </div>
              <span className="text-gray-300">›</span>
            </button>
          </li>
        ))}
      </ul>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title="시술 내역 상세"
      >
        {selected && (
          <div className="space-y-4" data-testid="my-visit-detail">
            {selected.before_after_photo_url ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-50">
                <Image
                  src={selected.before_after_photo_url}
                  alt={selected.treatment_name}
                  fill
                  sizes="(max-width: 512px) 100vw, 512px"
                  className="object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-gray-50 text-sm text-gray-300">
                등록된 사진이 없습니다
              </div>
            )}

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">시술</dt>
                <dd className="font-medium text-gray-800">
                  {selected.treatment_name}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">방문일</dt>
                <dd className="font-medium text-gray-800">
                  {selected.visited_at.slice(0, 10)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">결제금액</dt>
                <dd className="font-medium text-gray-800">
                  {selected.price_paid.toLocaleString()}원
                </dd>
              </div>
            </dl>
          </div>
        )}
      </Modal>
    </>
  )
}
