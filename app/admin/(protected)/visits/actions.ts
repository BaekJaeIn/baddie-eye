'use server'

import { revalidatePath } from 'next/cache'
import * as Sentry from '@sentry/nextjs'
import { createClient } from '@/lib/supabase/server'
import { visitEditSchema } from '@/lib/validations/visit'

export interface VisitActionState {
  error?: string
  ok?: boolean
}

const GENERIC_ERROR = '저장 중 오류가 발생했습니다. 다시 시도해주세요.'

export async function updateVisitAction(
  id: string,
  memberId: string,
  _prev: VisitActionState,
  formData: FormData,
): Promise<VisitActionState> {
  const parsed = visitEditSchema.safeParse({
    price_paid: formData.get('price_paid'),
    visited_at: formData.get('visited_at'),
    before_after_photo_url: formData.get('before_after_photo_url'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '입력값을 확인해주세요' }
  }

  const supabase = createClient()
  try {
    const { error } = await supabase
      .from('visit_history')
      .update(parsed.data)
      .eq('id', id)
    if (error) {
      Sentry.captureException(error)
      return { error: GENERIC_ERROR }
    }
  } catch (err) {
    Sentry.captureException(err)
    return { error: GENERIC_ERROR }
  }

  revalidatePath('/admin/visits')
  revalidatePath(`/admin/members/${memberId}`)
  return { ok: true }
}
