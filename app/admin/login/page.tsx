import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-brand">Baddie Eye</h1>
          <p className="mt-1 text-sm text-gray-500">관리자 로그인</p>
        </div>
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
