/**
 * 외부 예약 채널(네이버 예약 등) 연동을 위한 추상 인터페이스.
 *
 * 현재는 "정의"만 존재하며 실제 연동은 없다. (미연동)
 * 네이버 예약 파트너 API 승인 + 키 발급 후, 이 인터페이스를 구현하는
 * 어댑터(lib/integrations/naver)를 완성해 연결하면 된다.
 *
 * 동기화 모델 (양방향):
 *  1) 우리 → 외부: 우리 캘린더의 가용/차단 시간을 외부에 반영(pushAvailability)
 *  2) 외부 → 우리: 외부에서 들어온 예약을 우리 시스템으로 가져옴(fetchReservations)
 *     - 가져온 예약은 appointments 테이블에 external_source/external_id로 기록해
 *       중복 없이 동기화한다(아래 README 참고).
 */

// 외부 시스템에서 들어온 예약 1건
export interface ExternalReservation {
  externalId: string // 외부 채널의 예약 고유 ID (중복 방지 키)
  treatmentName: string
  scheduledAt: string // ISO 8601 (+09:00)
  customerName?: string
  customerPhone?: string
  memo?: string
}

// 특정 슬롯의 가용 여부
export interface AvailabilitySlot {
  date: string // YYYY-MM-DD
  time: string // HH:mm (KST)
  available: boolean
}

export interface BookingProvider {
  readonly name: string

  // 키/환경변수가 설정되어 실제 호출 가능한 상태인지
  isConfigured(): boolean

  // 우리 시스템 → 외부: 가용 시간(오픈/차단)을 외부 채널에 반영
  pushAvailability(slots: AvailabilitySlot[]): Promise<void>

  // 외부 → 우리 시스템: since 이후 신규/변경 예약 조회 (폴링 또는 웹훅 처리)
  fetchReservations(since: string): Promise<ExternalReservation[]>
}
