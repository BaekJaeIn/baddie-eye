'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Member, TreatmentType } from '@/types/database'
import {
  shiftWeek,
  extractKstDate,
  extractTime,
  WEEKDAY_LABELS,
} from '@/lib/booking/slots'
import { STATUS_LABEL, STATUS_STYLE } from '@/lib/booking/status'
import {
  createAppointmentAction,
  updateAppointmentAction,
} from '@/app/admin/(protected)/appointments/actions'
import Modal from '@/components/ui/Modal'
import WeekCalendar, { type CalendarAppointment } from './WeekCalendar'
import DayCalendar from './DayCalendar'
import AppointmentForm from './AppointmentForm'
import AppointmentStatusActions from './AppointmentStatusActions'

function todayKst() {
  return extractKstDate(new Date().toISOString())
}

interface Props {
  weekStart: string
  days: string[]
  appointments: CalendarAppointment[]
  members: Pick<Member, 'id' | 'name'>[]
  treatments: Pick<TreatmentType, 'id' | 'name'>[]
}

export default function AppointmentsBoard({
  weekStart,
  days,
  appointments,
  members,
  treatments,
}: Props) {
  const router = useRouter()
  // 등록 모달: 빈 슬롯 클릭(날짜/시간 프리필) 또는 전체 등록(빈 값)
  const [newSlot, setNewSlot] = useState<{
    date?: string
    time?: string
  } | null>(null)
  // 상세 모달
  const [detail, setDetail] = useState<CalendarAppointment | null>(null)
  // 수정 모달
  const [editing, setEditing] = useState<CalendarAppointment | null>(null)
  // 모바일 일별 보기에서 선택된 날짜
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const t = todayKst()
    return days.includes(t) ? t : days[0]
  })

  // 주가 바뀌면 선택 날짜를 새 주 범위로 보정
  useEffect(() => {
    if (!days.includes(selectedDay)) {
      const t = todayKst()
      setSelectedDay(days.includes(t) ? t : days[0])
    }
  }, [days, selectedDay])

  const refresh = () => router.refresh()
  const closeAll = () => {
    setNewSlot(null)
    setDetail(null)
    setEditing(null)
  }
  const onSaved = () => {
    closeAll()
    refresh()
  }

  const canBook = members.length > 0 && treatments.length > 0

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-gray-800">예약 관리</h2>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/appointments?week=${shiftWeek(weekStart, -1)}`}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            ← 이전 주
          </Link>
          <Link
            href="/admin/appointments"
            className="rounded-md border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            오늘
          </Link>
          <Link
            href={`/admin/appointments?week=${shiftWeek(weekStart, 1)}`}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            다음 주 →
          </Link>
          <span className="w-full text-sm text-gray-500 sm:ml-2 sm:w-auto">
            {days[0]} ~ {days[6]}
          </span>
        </div>
        <button
          onClick={() => setNewSlot({})}
          disabled={!canBook}
          data-testid="appointment-create-button"
          className="w-full rounded-md bg-brand px-4 py-2 text-sm text-white hover:bg-brand-dark disabled:opacity-50 sm:w-auto"
          title={canBook ? '' : '회원과 시술 종류를 먼저 등록해주세요'}
        >
          + 예약 등록
        </button>
      </div>

      {/* 데스크톱: 주간 보기 */}
      <div className="hidden md:block">
        <WeekCalendar
          weekStart={weekStart}
          appointments={appointments}
          onSlotClick={(date, time) => {
            if (canBook) setNewSlot({ date, time })
          }}
          onAppointmentClick={(apt) => setDetail(apt)}
        />
      </div>

      {/* 모바일: 일별 보기 (요일 칩 + 하루 캘린더) */}
      <div className="md:hidden">
        <div className="mb-3 flex gap-1">
          {days.map((date, i) => {
            const isSel = date === selectedDay
            const isToday = date === todayKst()
            return (
              <button
                key={date}
                onClick={() => setSelectedDay(date)}
                data-testid={`day-chip-${date}`}
                className={
                  isSel
                    ? 'flex-1 basis-0 rounded-md bg-brand py-1.5 text-center text-white'
                    : `flex-1 basis-0 rounded-md py-1.5 text-center ${isToday ? 'bg-brand-light/10 text-brand' : 'bg-gray-50 text-gray-600'}`
                }
              >
                <div className="text-[10px]">{WEEKDAY_LABELS[i]}</div>
                <div className="text-xs font-medium">{date.slice(8)}</div>
              </button>
            )
          })}
        </div>
        <DayCalendar
          date={selectedDay}
          appointments={appointments}
          onSlotClick={(date, time) => {
            if (canBook) setNewSlot({ date, time })
          }}
          onAppointmentClick={(apt) => setDetail(apt)}
        />
      </div>

      {/* 등록 모달 */}
      <Modal
        open={!!newSlot}
        onClose={() => setNewSlot(null)}
        title="예약 등록"
      >
        {newSlot && (
          <AppointmentForm
            action={createAppointmentAction}
            members={members}
            treatments={treatments}
            defaults={{ date: newSlot.date, time: newSlot.time }}
            onSuccess={onSaved}
          />
        )}
      </Modal>

      {/* 상세 모달 */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="예약 상세">
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">상태</span>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_STYLE[detail.status]}`}
              >
                {STATUS_LABEL[detail.status]}
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Field label="회원" value={detail.member_name} />
              <Field label="시술" value={detail.treatment_name} />
              <Field
                label="일시"
                value={`${extractKstDate(detail.scheduled_at)} ${extractTime(detail.scheduled_at)}`}
              />
              <Field label="메모" value={detail.memo ?? '-'} />
            </dl>
            {(detail.status === 'requested' ||
              detail.status === 'pending') && (
              <div className="border-t border-gray-100 pt-4">
                <AppointmentStatusActions
                  id={detail.id}
                  status={detail.status}
                  onDone={onSaved}
                  onEdit={() => {
                    setEditing(detail)
                    setDetail(null)
                  }}
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 수정 모달 */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="예약 변경">
        {editing && (
          <AppointmentForm
            action={updateAppointmentAction.bind(null, editing.id)}
            members={members}
            treatments={treatments}
            defaults={{
              member_id: editing.member_id,
              treatment_type_id: editing.treatment_type_id,
              date: extractKstDate(editing.scheduled_at),
              time: extractTime(editing.scheduled_at),
              memo: editing.memo,
            }}
            onSuccess={onSaved}
          />
        )}
      </Modal>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className="text-gray-800">{value}</dd>
    </div>
  )
}
