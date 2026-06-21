# 외부 예약 연동 (준비 단계)

네이버 예약 등 외부 채널과 예약/가용시간을 동기화하기 위한 **추상화 레이어**입니다.
현재는 **인터페이스 + 네이버 어댑터 골격**만 있고 실제 연동은 하지 않습니다.

## 구성

- `booking-provider.ts` — 외부 예약 채널이 구현해야 할 공통 인터페이스(`BookingProvider`)
- `naver/index.ts` — 네이버 예약 어댑터 골격(미구현 stub)

## 네이버 예약 연동에 필요한 것 (실제 구현 시)

1. **네이버 스마트플레이스**에 매장(속눈썹연장샵) 등록 및 네이버 예약 사용
2. **네이버 예약 파트너 API 사용 승인** 신청 (사업자/제휴 심사)
3. 승인 후 **Client ID / Secret / Business ID** 발급
4. 환경변수 설정:
   - `NAVER_BOOKING_CLIENT_ID`
   - `NAVER_BOOKING_CLIENT_SECRET`
   - `NAVER_BOOKING_BUSINESS_ID`

## 구현 시 작업 항목 (체크리스트)

- [ ] `naver/index.ts`의 `fetchReservations()` — 네이버 신규 예약 조회 구현
- [ ] `naver/index.ts`의 `pushAvailability()` — 우리 캘린더 가용/차단 시간을 네이버에 반영
- [ ] `appointments` 테이블에 외부 출처 컬럼 추가 (마이그레이션):
      `external_source TEXT`(예: 'naver'), `external_id TEXT`,
      `UNIQUE(external_source, external_id)` — 중복 동기화 방지
- [ ] 동기화 트리거:
  - 폴링: Cron(`app/api/cron/...`)에서 주기적으로 `fetchReservations()` 호출 후 upsert
  - 또는 웹훅: 네이버 → 우리 엔드포인트(`app/api/integrations/naver/route.ts`)
- [ ] 시술 매핑: 네이버 상품 ↔ 우리 `treatment_types` 매핑 테이블/설정
- [ ] 가용시간 동기화 충돌 처리: 우리 시스템과 네이버 동시 예약 시 우선순위 규칙

## 사용 예 (구현 완료 후)

```ts
import { naverBookingProvider } from '@/lib/integrations/naver'

if (naverBookingProvider.isConfigured()) {
  const reservations = await naverBookingProvider.fetchReservations(since)
  // → appointments 테이블에 external_id 기준 upsert
}
```
