import type { Metadata, Viewport } from 'next'
import './globals.css'
import ServiceWorkerRegister from '@/components/pwa/ServiceWorkerRegister'
import { ConfirmProvider } from '@/components/ui/ConfirmDialog'

export const metadata: Metadata = {
  title: 'Baddie Eye — Premium Lash Studio',
  description: '속눈썹연장샵 회원·예약·시술 관리 시스템',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Baddie Eye',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#9c7a70',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <ConfirmProvider>{children}</ConfirmProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
