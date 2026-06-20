import { createClient } from '@/lib/supabase/client'

// [BR-IMG-01,02] 이미지 검증 상수
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5MB
const BUCKET = 'visit-photos'

// 클라이언트 검증 — 통과 시 null, 실패 시 에러 메시지
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'jpg, png, webp 이미지만 업로드할 수 있습니다'
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return '이미지 크기는 5MB 이하여야 합니다'
  }
  return null
}

function extFromType(type: string): string {
  if (type === 'image/png') return 'png'
  if (type === 'image/webp') return 'webp'
  return 'jpg'
}

// Supabase Storage 업로드 → 공개 URL 반환 [BR-IMG-03]
export async function uploadVisitPhoto(
  file: File,
  memberId: string,
  visitId: string,
): Promise<string> {
  const error = validateImageFile(file)
  if (error) throw new Error(error)

  const supabase = createClient()
  const path = `${memberId}/${visitId}-${Date.now()}.${extFromType(file.type)}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) throw new Error('사진 업로드에 실패했습니다')

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
