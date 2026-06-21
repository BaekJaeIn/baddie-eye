'use server'

import * as Sentry from '@sentry/nextjs'
import { createClient } from '@/lib/supabase/server'
import { subscriptionSchema } from '@/lib/validations/push'

// 구독 저장 [BR-PS-03,05]
// isOwner=true는 "원장 알림(예약 신청)" 대상으로 표시. 단, 실제 관리자
// (app_metadata.role === 'admin')만 허용 — 회원이 원장 알림을 가로채지 못하게 한다.
export async function saveSubscriptionAction(
  sub: unknown,
  isOwner = false,
): Promise<{ ok: boolean }> {
  const parsed = subscriptionSchema.safeParse(sub)
  if (!parsed.success) return { ok: false }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false }

  const isAdmin = (user.app_metadata as { role?: string })?.role === 'admin'
  const ownerFlag = isOwner && isAdmin

  try {
    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: user.id,
        endpoint: parsed.data.endpoint,
        p256dh: parsed.data.keys.p256dh,
        auth: parsed.data.keys.auth,
        is_owner: ownerFlag,
      },
      { onConflict: 'endpoint' },
    )
    if (error) {
      Sentry.captureException(error)
      return { ok: false }
    }
  } catch (err) {
    Sentry.captureException(err)
    return { ok: false }
  }
  return { ok: true }
}

export async function deleteSubscriptionAction(
  endpoint: string,
): Promise<void> {
  const supabase = createClient()
  try {
    await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
  } catch (err) {
    Sentry.captureException(err)
  }
}
