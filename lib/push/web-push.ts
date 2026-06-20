import webpush from 'web-push'

let configured = false

function ensureConfigured(): boolean {
  if (configured) return true
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:owner@example.com'
  if (!publicKey || !privateKey) return false
  webpush.setVapidDetails(subject, publicKey, privateKey)
  configured = true
  return true
}

export interface PushTarget {
  endpoint: string
  p256dh: string
  auth: string
}

export interface PushPayload {
  title: string
  body: string
  url: string
}

export interface SendResult {
  ok: boolean
  gone?: boolean // 410/404 — 만료 구독 [BR-RM-05]
}

export async function sendPush(
  target: PushTarget,
  payload: PushPayload,
): Promise<SendResult> {
  if (!ensureConfigured()) return { ok: false }

  try {
    await webpush.sendNotification(
      {
        endpoint: target.endpoint,
        keys: { p256dh: target.p256dh, auth: target.auth },
      },
      JSON.stringify(payload),
    )
    return { ok: true }
  } catch (err) {
    const statusCode = (err as { statusCode?: number }).statusCode
    if (statusCode === 410 || statusCode === 404) {
      return { ok: false, gone: true }
    }
    return { ok: false }
  }
}
