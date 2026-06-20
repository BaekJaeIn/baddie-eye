import { describe, it, expect } from 'vitest'
import {
  validateImageFile,
  MAX_IMAGE_BYTES,
} from '@/lib/visit/upload'

function fakeFile(type: string, size: number): File {
  const file = new File(['x'], 'photo', { type })
  // File의 size를 직접 제어 (내용 기반 재계산 회피)
  Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('validateImageFile', () => {
  it('jpg/png/webp 통과', () => {
    expect(validateImageFile(fakeFile('image/jpeg', 1000))).toBeNull()
    expect(validateImageFile(fakeFile('image/png', 1000))).toBeNull()
    expect(validateImageFile(fakeFile('image/webp', 1000))).toBeNull()
  })

  it('허용되지 않은 타입 거부', () => {
    expect(validateImageFile(fakeFile('image/gif', 1000))).toContain('이미지')
    expect(validateImageFile(fakeFile('application/pdf', 1000))).not.toBeNull()
  })

  it('5MB 초과 거부', () => {
    expect(
      validateImageFile(fakeFile('image/jpeg', MAX_IMAGE_BYTES + 1)),
    ).toContain('5MB')
  })

  it('5MB 이하 통과', () => {
    expect(validateImageFile(fakeFile('image/jpeg', MAX_IMAGE_BYTES))).toBeNull()
  })
})
