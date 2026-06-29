import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Member } from '@/types/database'
import { formatPhone } from '@/lib/format'
import {
  TERMS_TITLE,
  TERMS_INTRO,
  TERMS_SECTIONS,
  TERMS_VERSION,
} from '@/lib/consent/terms'
import ConsentForm from './ConsentForm'

interface ConsentPageProps {
  params: { memberId: string }
}

// 태블릿 동의서 — 2단계: 규약 표시 + 동의 받기
export default async function ConsentPage({ params }: ConsentPageProps) {
  const supabase = createClient()
  const { data } = await supabase
    .from('members')
    .select('*')
    .eq('id', params.memberId)
    .eq('is_active', true)
    .single()

  const member = data as Member | null
  if (!member) notFound()

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/tablet"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← 회원 다시 선택
        </Link>
        <span className="text-xs text-gray-400">버전 {TERMS_VERSION}</span>
      </div>

      <div className="mb-6 rounded-xl bg-white px-5 py-4 shadow-sm">
        <p className="text-sm text-gray-500">동의 대상</p>
        <p className="text-xl font-semibold text-gray-800">
          {member.name}
          <span className="ml-3 text-base font-normal text-gray-500">
            {formatPhone(member.phone)}
          </span>
        </p>
      </div>

      <article className="max-h-[55vh] overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800">{TERMS_TITLE}</h2>
        <p className="mt-3 text-gray-600">{TERMS_INTRO}</p>

        {TERMS_SECTIONS.map((section) => (
          <section key={section.title} className="mt-6">
            <h3 className="font-semibold text-gray-800">{section.title}</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-600">
              {section.body.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </section>
        ))}
      </article>

      <ConsentForm memberId={member.id} />
    </div>
  )
}
