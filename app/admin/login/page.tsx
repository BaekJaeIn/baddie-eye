import Image from 'next/image'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Image
            src="/logo-admin.png"
            alt="Baddie Eye"
            width={560}
            height={121}
            className="mx-auto w-64 rounded-md"
            priority
            unoptimized
          />
          <p className="mt-3 text-sm text-gray-500">관리자 로그인</p>
        </div>
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
