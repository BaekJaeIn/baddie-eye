'use server'

import * as Sentry from '@sentry/nextjs'
import { createClient } from '@/lib/supabase/server'
import { subscriptionSchema } from '@/lib/validations/push'

// 구독 저장 [BR-PS-03,05]
export async function saveSubscriptionAction(
  sub: unknown,
): Promise<{ ok: boolean }> {
  const parsed = subscriptionSchema.safeParse(sub)
  if (!parsed.success) return { ok: false }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false }

  try {
    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: user.id,
        endpoint: parsed.data.endpoint,
        p256dh: parsed.data.keys.p256dh,
        auth: parsed.data.keys.auth,
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
