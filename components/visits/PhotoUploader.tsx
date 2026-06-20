'use client'

import { useState } from 'react'
import Image from 'next/image'
import { uploadVisitPhoto, validateImageFile } from '@/lib/visit/upload'

interface PhotoUploaderProps {
  memberId: string
  visitId: string
  initialUrl: string | null
  // hidden input name으로 폼에 URL 전달
  name: string
}

export default function PhotoUploader({
  memberId,
  visitId,
  initialUrl,
  name,
}: PhotoUploaderProps) {
  const [url, setUrl] = useState<string>(initialUrl ?? '')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = validateImageFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setUploading(true)
    try {
      const publicUrl = await uploadVisitPhoto(file, memberId, visitId)
      setUrl(publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드 실패')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2" data-testid="photo-uploader">
      {/* 폼 제출용 hidden — 업로드된 공개 URL */}
      <input type="hidden" name={name} value={url} />

      {url && (
        <div className="relative h-40 w-40 overflow-hidden rounded-md border border-gray-200">
          <Image
            src={url}
            alt="시술 사진"
            fill
            sizes="160px"
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        disabled={uploading}
        data-testid="visit-photo-input"
        className="block text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm hover:file:bg-gray-200"
      />
      {uploading && <p className="text-xs text-gray-400">업로드 중...</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
