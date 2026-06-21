import { createAdminClient } from '@/lib/supabase/admin'
import { sendPush } from '@/lib/push/web-push'

/**
 * 앱 알림 디스패치 레이어.
 *
 * 현재 활성 채널: Web Push (브라우저/PWA 알림)
 *
 * 향후 카카오 알림톡(Alimtalk) 등 채널 추가 지점:
 *  - 알림톡은 전화번호 기반이므로, notifyOwners/notifyUser에서
 *    수신자 전화번호를 조회해 알림톡 어댑터(sendAlimtalk)로 함께 보내면 된다.
 *  - 채널은 서로 독립적으로 동작하고, 한 채널 실패가 본 동작(예약 등)에
 *    영향을 주지 않도록 모든 발송은 try/catch로 격리한다.
 */

export interface NotifyMessage {
  title: string
  body: string
  url: string
}

interface SubRow {
  id: string
  endpoint: string
  p256dh: string
  auth: string
}

type AdminClient = ReturnType<typeof createAdminClient>

// 구독 목록으로 Web Push 발송 + 만료(410/404) 구독 정리
async function pushToSubscriptions(
  supabase: AdminClient,
  subs: SubRow[],
  message: NotifyMessage,
): Promise<void> {
  for (const sub of subs) {
    const result = await sendPush(sub, message)
    if (result.gone) {
      await supabase.from('push_subscriptions').delete().eq('id', sub.id)
    }
  }
}

// 원장(들)에게 알림 — is_owner 구독 대상. RLS 우회 위해 service_role 사용.
export async function notifyOwners(message: NotifyMessage): Promise<void> {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('is_owner', true)
    await pushToSubscriptions(supabase, (data ?? []) as SubRow[], message)
  } catch {
    // 알림 실패는 본 동작(예약 신청)에 영향을 주지 않는다.
  }
}

// 특정 회원(auth user_id)에게 알림.
export async function notifyUser(
  userId: string,
  message: NotifyMessage,
): Promise<void> {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('user_id', userId)
    await pushToSubscriptions(supabase, (data ?? []) as SubRow[], message)
  } catch {
    // 알림 실패는 본 동작(예약 확정)에 영향을 주지 않는다.
  }
}
