import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

type CookieToSet = { name: string; value: string; options: CookieOptions }

// 서버 컴포넌트 / Server Action / Route Handler 용 Supabase 클라이언트.
// 매 요청마다 새로 생성해야 함 (쿠키 스토어가 요청별로 다름).
export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Server Component에서 호출되면 set이 무시될 수 있음.
            // 미들웨어가 세션을 갱신하므로 안전하게 무시 가능.
          }
        },
      },
    },
  )
}
