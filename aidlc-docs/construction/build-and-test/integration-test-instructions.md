# Integration Test Instructions — 전체 프로젝트

## 목적

Admin ↔ Member ↔ Supabase 간 통합 흐름을 검증한다.
단위 테스트(순수 로직)와 달리, 실제 Supabase 연결 + 인증이 필요한 종단 흐름이다.

## 통합 환경 준비

[DEPLOYMENT.md](../../../DEPLOYMENT.md) 1~2단계 수행:
- Supabase 프로젝트 + 마이그레이션 001~007
- Admin 계정 + role='admin'
- 카카오 provider (고객 로그인 시나리오용)
- `.env.local` 설정

```bash
pnpm install
pnpm dev
```

## 핵심 통합 시나리오

### 시나리오 1: 회원 → 예약 → 시술내역 → 통계 (Admin 종단)
1. Admin 로그인 → 회원 등록
2. 시술 종류 등록 (권장주기 포함)
3. 예약 캘린더에서 예약 등록(pending)
4. 예약 완료 처리 → visit_history 자동 생성 확인
5. 시술 내역 편집 (결제금액/사진)
6. 통계 페이지에서 매출/시술별/신규 반영 확인
**검증**: 각 단계 데이터가 다음 단계에 연결됨

### 시나리오 2: 고객 예약 → 원장 승인 (양방향)
1. 고객 카카오 로그인 → 온보딩(전화번호로 회원 연결)
2. 고객 /booking에서 가용 슬롯 선택 → 신청(requested)
3. Admin 대시보드 "승인 대기" 배너 → 예약 상세 승인
4. 고객 /me/appointments에서 '확정' 상태 확인
**검증**: requested → pending 상태 전이, 양쪽 화면 동기화

### 시나리오 3: 재방문 권장 (visit_history → 3곳 표시)
1. 권장주기 있는 시술로 visit_history 생성
2. 회원 상세/목록 배지 + 대시보드 재방문 목록 + 고객 마이페이지 확인
**검증**: member_last_visit 뷰 기반 D-day 일관성

### 시나리오 4: 푸시 리마인더 (Cron)
1. 고객 마이페이지에서 푸시 구독
2. 24시간 후 확정 예약 생성
3. `curl -H "Authorization: Bearer $CRON_SECRET" .../api/cron/reminders`
4. 푸시 수신 + reminder_sent_at 기록 확인
**검증**: 발송 1회, 중복 방지

### 시나리오 5: RLS 격리 (보안)
1. 고객 A로 로그인 → 자기 데이터만 조회됨
2. 다른 회원 데이터 직접 접근 시도 → RLS 차단
**검증**: admin-or-owner 정책

## 정리
시나리오는 테스트 데이터를 생성하므로, 검증 후 Supabase에서 정리하거나
별도 테스트 프로젝트 사용 권장.
