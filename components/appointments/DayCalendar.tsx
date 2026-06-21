'use client'

import { Fragment } from 'react'
import { generateSlots, extractTime, extractKstDate } from '@/lib/booking/slots'
import { STATUS_CALENDAR_STYLE } from '@/lib/booking/status'
import type { CalendarAppointment } from './WeekCalendar'

const ROW_HEIGHT = '2.75rem' // 슬롯 1칸(30분) 높이 — 모바일에서 더 넉넉히

interface DayCalendarProps {
  date: string // YYYY-MM-DD (KST)
  appointments: CalendarAppointment[]
  onSlotClick: (date: string, time: string) => void
  onAppointmentClick: (apt: CalendarAppointment) => void
}

// 모바일용 하루(일별) 캘린더 — 시간 세로 + 단일 일자 열.
export default function DayCalendar({
  date,
  appointments,
  onSlotClick,
  onAppointmentClick,
}: DayCalendarProps) {
  const slots = generateSlots()
  const slotIndex = new Map(slots.map((s, i) => [s, i]))
  const dayAppts = appointments.filter(
    (a) => extractKstDate(a.scheduled_at) === date,
  )

  return (
    <div
      className="overflow-hidden rounded-lg border border-gray-100"
      data-testid="day-calendar"
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: '3.5rem 1fr',
          gridTemplateRows: `repeat(${slots.length}, ${ROW_HEIGHT})`,
        }}
      >
        {slots.map((time, r) => (
          <Fragment key={time}>
            <div
              style={{ gridColumn: 1, gridRow: r + 1 }}
              className="flex items-start justify-end border-t border-gray-100 bg-gray-50 px-2 pt-0.5 text-[11px] text-gray-400"
            >
              {time}
            </div>
            <button
              style={{ gridColumn: 2, gridRow: r + 1 }}
              onClick={() => onSlotClick(date, time)}
              data-testid={`day-slot-${date}-${time}`}
              className="border-l border-t border-gray-100 transition hover:bg-gray-50"
              aria-label={`${date} ${time} 빈 슬롯`}
            />
          </Fragment>
        ))}

        {dayAppts.map((apt) => {
          const startIdx = slotIndex.get(extractTime(apt.scheduled_at))
          if (startIdx === undefined) return null
          const rawSpan = Math.max(1, Math.ceil((apt.duration_min || 30) / 30))
          const span = Math.min(rawSpan, slots.length - startIdx)
          return (
            <button
              key={apt.id}
              onClick={() => onAppointmentClick(apt)}
              data-testid={`day-appointment-${apt.id}`}
              style={{
                gridColumn: 2,
                gridRow: `${startIdx + 1} / span ${span}`,
              }}
              className={`z-10 m-px flex flex-col overflow-hidden rounded px-2 py-1 text-left ${STATUS_CALENDAR_STYLE[apt.status]}`}
            >
              <div className="truncate text-sm font-medium">
                {apt.member_name}
              </div>
              <div className="truncate text-xs leading-tight">
                {apt.treatment_name}
              </div>
              <div className="mt-auto text-[10px] opacity-70">
                {extractTime(apt.scheduled_at)} · {apt.duration_min}분
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
