import type {
  BookingProvider,
  ExternalReservation,
} from '../booking-provider'

/**
 * 네이버 예약 어댑터 — 골격(stub)만 존재.
 *
 * 실제 구현 전제 조건:
 *  - 네이버 예약(스마트플레이스) 사업자 등록
 *  - 네이버 예약 파트너 API 사용 승인 + Client ID/Secret 발급
 *  - 환경변수: NAVER_BOOKING_CLIENT_ID, NAVER_BOOKING_CLIENT_SECRET,
 *              NAVER_BOOKING_BUSINESS_ID
 *
 * 승인/키 발급 후 pushAvailability / fetchReservations 내부를
 * 네이버 API 호출로 채우면 된다. (lib/integrations/README.md 참고)
 */

const NOT_IMPLEMENTED =
  '네이버 예약 연동 미구현: 파트너 API 승인 및 키 발급 후 구현이 필요합니다.'

export const naverBookingProvider: BookingProvider = {
  name: 'naver',

  isConfigured() {
    return Boolean(
      process.env.NAVER_BOOKING_CLIENT_ID &&
        process.env.NAVER_BOOKING_CLIENT_SECRET &&
        process.env.NAVER_BOOKING_BUSINESS_ID,
    )
  },

  async pushAvailability(): Promise<void> {
    throw new Error(NOT_IMPLEMENTED)
  },

  async fetchReservations(): Promise<ExternalReservation[]> {
    throw new Error(NOT_IMPLEMENTED)
  },
}
