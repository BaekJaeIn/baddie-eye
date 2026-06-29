import LoginForm from '@/components/auth/LoginForm'
import InstallButton from '@/components/pwa/InstallButton'
import Logo from '@/components/ui/Logo'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="mx-auto h-12 w-64" />
          <p className="mt-3 text-sm text-gray-500">관리자 로그인</p>
        </div>
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <LoginForm />
        </div>
        <div className="mt-4">
          <InstallButton />
        </div>
      </div>
    </main>
  )
}
