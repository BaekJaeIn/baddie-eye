'use server'

import { revalidatePath } from 'next/cache'
import * as Sentry from '@sentry/nextjs'
import { createClient } from '@/lib/supabase/server'
import { treatmentSchema } from '@/lib/validations/treatment'

export interface TreatmentActionState {
  error?: string
  ok?: boolean
}

const GENERIC_ERROR = '저장 중 오류가 발생했습니다. 다시 시도해주세요.'
const DUPLICATE_NAME_ERROR = '이미 등록된 시술명입니다'
const IN_USE_ERROR = '사용 중인 시술은 삭제할 수 없습니다'

function parseForm(formData: FormData) {
  return treatmentSchema.safeParse({
    name: formData.get('name'),
    duration_min: formData.get('duration_min'),
    base_price: formData.get('base_price'),
    recommended_interval_days: formData.get('recommended_interval_days'),
  })
}

export async function createTreatmentAction(
  _prev: TreatmentActionState,
  formData: FormData,
): Promise<TreatmentActionState> {
  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '입력값을 확인해주세요' }
  }

  const supabase = createClient()
  try {
    const { error } = await supabase.from('treatment_types').insert(parsed.data)
    if (error) {
      if (error.code === '23505') return { error: DUPLICATE_NAME_ERROR }
      Sentry.captureException(error)
      return { error: GENERIC_ERROR }
    }
  } catch (err) {
    Sentry.captureException(err)
    return { error: GENERIC_ERROR }
  }

  revalidatePath('/admin/treatments')
  return { ok: true }
}

export async function updateTreatmentAction(
  id: string,
  _prev: TreatmentActionState,
  formData: FormData,
): Promise<TreatmentActionState> {
  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '입력값을 확인해주세요' }
  }

  const supabase = createClient()
  try {
    const { error } = await supabase
      .from('treatment_types')
      .update(parsed.data)
      .eq('id', id)
    if (error) {
      if (error.code === '23505') return { error: DUPLICATE_NAME_ERROR }
      Sentry.captureException(error)
      return { error: GENERIC_ERROR }
    }
  } catch (err) {
    Sentry.captureException(err)
    return { error: GENERIC_ERROR }
  }

  revalidatePath('/admin/treatments')
  return { ok: true }
}

// 삭제 — 예약/시술내역 참조 시 FK 제약(23503)으로 차단 [BR-TRT-05]
export async function deleteTreatmentAction(
  id: string,
): Promise<{ error?: string }> {
  const supabase = createClient()
  try {
    const { error } = await supabase
      .from('treatment_types')
      .delete()
      .eq('id', id)
    if (error) {
      if (error.code === '23503') return { error: IN_USE_ERROR }
      Sentry.captureException(error)
      return { error: GENERIC_ERROR }
    }
  } catch (err) {
    Sentry.captureException(err)
    return { error: GENERIC_ERROR }
  }

  revalidatePath('/admin/treatments')
  return {}
}
