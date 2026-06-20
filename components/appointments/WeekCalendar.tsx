'use client'

import { Fragment } from 'react'
import {
  generateSlots,
  getWeekDays,
  extractTime,
  extractKstDate,
  toDateStr,
  WEEKDAY_LABELS,
} from '@/lib/booking/slots'
import type { AppointmentStatus } from '@/types/database'
import { STATUS_CALENDAR_STYLE } from '@/lib/booking/status'

export interface CalendarAppointment {
  id: string
  scheduled_at: string
  status: AppointmentStatus
  member_name: string
  treatment_name: string
  // 시술 소요시간(분) — 캘린더 블록 높이
  duration_min: number
  // 모달 수정용
  member_id: string
  treatment_type_id: string
  memo: string | null
}

interface WeekCalendarProps {
  weekStart: string
  appointments: CalendarAppointment[]
  onSlotClick: (date: string, time: string) => void
  onAppointmentClick: (apt: CalendarAppointment) => void
}

const ROW_HEIGHT = '2.5rem' // 슬롯 1칸(30분) 높이

export default function WeekCalendar({
  weekStart,
  appointments,
  onSlotClick,
  onAppointmentClick,
}: WeekCalendarProps) {
  const slots = generateSlots()
  const days = getWeekDays(weekStart)
  const today = toDateStr(new Date())
  const slotIndex = new Map(slots.map((s, i) => [s, i]))
  const dayIndex = new Map(days.map((d, i) => [d, i]))

  return (
    <div className="overflow-x-auto" data-testid="week-calendar">
      <div
        className="grid min-w-[640px]"
        style={{
          gridTemplateColumns: '3rem repeat(7, minmax(0, 1fr))',
          gridTemplateRows: `auto repeat(${slots.length}, ${ROW_HEIGHT})`,
        }}
      >
        {/* 헤더 */}
        <div className="border-b border-gray-100 bg-gray-50" />
        {days.map((date, i) => (
          <div
            key={date}
            className={`border-b border-l border-gray-100 p-1 text-center ${
              date === today ? 'bg-brand-light/10' : 'bg-gray-50'
            }`}
          >
            <div className="text-xs font-medium text-gray-700">
              {WEEKDAY_LABELS[i]}
            </div>
            <div className="text-[10px] text-gray-400">{date.slice(5)}</div>
          </div>
        ))}

        {/* 시간 라벨 + 빈 슬롯 그리드 */}
        {slots.map((time, r) => (
          <Fragment key={time}>
            <div
              style={{ gridColumn: 1, gridRow: r + 2 }}
              className="flex items-start justify-center border-t border-gray-100 bg-gray-50 pt-0.5 text-[10px] text-gray-400"
            >
              {time}
            </div>
            {days.map((date, c) => (
              <button
                key={date}
                style={{ gridColumn: c + 2, gridRow: r + 2 }}
                onClick={() => onSlotClick(date, time)}
                data-testid={`calendar-slot-${date}-${time}`}
                className="border-l border-t border-gray-100 transition hover:bg-gray-50"
                aria-label={`${date} ${time} 빈 슬롯`}
              />
            ))}
          </Fragment>
        ))}

        {/* 예약 블록 — 소요시간만큼 grid-row span으로 하나의 박스 */}
        {appointments.map((apt) => {
          const date = extractKstDate(apt.scheduled_at)
          const startIdx = slotIndex.get(extractTime(apt.scheduled_at))
          const c = dayIndex.get(date)
          if (startIdx === undefined || c === undefined) return null // 범위 밖
          const rawSpan = Math.max(1, Math.ceil((apt.duration_min || 30) / 30))
          const span = Math.min(rawSpan, slots.length - startIdx)
          return (
            <button
              key={apt.id}
              onClick={() => onAppointmentClick(apt)}
              data-testid={`calendar-appointment-${apt.id}`}
              style={{
                gridColumn: c + 2,
                gridRow: `${startIdx + 2} / span ${span}`,
              }}
              className={`z-10 m-px flex flex-col overflow-hidden rounded px-1 py-0.5 text-left ${STATUS_CALENDAR_STYLE[apt.status]}`}
            >
              <div className="truncate text-xs font-medium">
                {apt.member_name}
              </div>
              <div className="truncate text-[10px] leading-tight">
                {apt.treatment_name}
              </div>
              <div className="mt-auto text-[10px] opacity-70">
                {apt.duration_min}분
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
