import { describe, it, expect } from 'vitest'
import { urlBase64ToUint8Array } from '@/lib/push/subscribe'

describe('urlBase64ToUint8Array', () => {
  it('base64url을 Uint8Array로 변환한다', () => {
    // 'hi' = base64 'aGk=' → base64url 'aGk'
    const result = urlBase64ToUint8Array('aGk')
    expect(Array.from(result)).toEqual([104, 105]) // 'h','i'
  })

  it('-, _ (base64url 문자)를 처리한다', () => {
    // 바이트 [251, 255] = base64 '+/8=' → base64url '-_8'
    const result = urlBase64ToUint8Array('-_8')
    expect(Array.from(result)).toEqual([251, 255])
  })

  it('패딩 없는 입력도 처리한다', () => {
    const result = urlBase64ToUint8Array('QQ') // 'A'
    expect(Array.from(result)).toEqual([65])
  })
})
