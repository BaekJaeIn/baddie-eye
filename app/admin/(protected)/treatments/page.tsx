import { createClient } from '@/lib/supabase/server'
import type { TreatmentType } from '@/types/database'
import DeleteTreatmentButton from '@/components/treatments/DeleteTreatmentButton'
import TreatmentEditButton from '@/components/treatments/TreatmentEditButton'
import TreatmentCreateButton from '@/components/treatments/TreatmentCreateButton'

export default async function TreatmentsPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('treatment_types')
    .select('*')
    .order('name', { ascending: true })

  const treatments = (data ?? []) as TreatmentType[]

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-gray-800">시술 종류</h2>
      <div className="mb-4 flex justify-end">
        <TreatmentCreateButton />
      </div>

      {treatments.length === 0 ? (
        <p data-testid="treatment-empty" className="py-12 text-center text-gray-400">
          등록된 시술 종류가 없습니다.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
          <table className="w-full text-sm" data-testid="treatment-table">
            <thead className="border-b border-gray-100 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">시술명</th>
                <th className="px-4 py-3">소요시간</th>
                <th className="px-4 py-3">기본가격</th>
                <th className="px-4 py-3">권장주기</th>
                <th className="px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {treatments.map((t) => (
                <tr key={t.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {t.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.duration_min}분</td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.base_price.toLocaleString()}원
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.recommended_interval_days
                      ? `${t.recommended_interval_days}일`
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <TreatmentEditButton treatment={t} />
                    <DeleteTreatmentButton id={t.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
