'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { getSiteOrigin } from '@/lib/site-url'

/**
 * 회원이 휴대폰으로 스캔하면 회원용 앱(로그인 화면)으로 바로 이동하는 QR.
 * 배포 주소를 별도로 입력할 필요 없이, 현재 접속한 도메인을 기준으로 생성한다.
 */
export default function InstallQR() {
  const [dataUrl, setDataUrl] = useState<string>('')
  const [target, setTarget] = useState<string>('')

  useEffect(() => {
    const url = `${getSiteOrigin()}/login`
    setTarget(url)
    QRCode.toDataURL(url, {
      width: 320,
      margin: 2,
      color: { dark: '#3f3a36', light: '#ffffff' },
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(''))
  }, [])

  return (
    <div className="flex flex-col items-center gap-3">
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dataUrl}
          alt="회원 앱 설치 QR 코드"
          width={240}
          height={240}
          className="rounded-lg border border-gray-100"
        />
      ) : (
        <div className="h-60 w-60 animate-pulse rounded-lg bg-gray-100" />
      )}
      {target && (
        <a
          href={target}
          target="_blank"
          rel="noreferrer"
          className="break-all text-center text-xs text-gray-400 hover:text-brand"
        >
          {target}
        </a>
      )}
    </div>
  )
}
