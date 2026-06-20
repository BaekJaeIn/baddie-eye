import { createClient } from '@supabase/supabase-js'

// ⚠️ service_role 클라이언트 — RLS를 우회한다. Cron 등 서버 전용.
// 절대 클라이언트 컴포넌트에서 import 금지. [BR-CR-03,04]
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}
