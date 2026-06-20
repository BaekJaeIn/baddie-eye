# 배포 점검 체크리스트 — Baddie Eye

## 사전 준비
- [ ] Supabase 프로젝트 생성 (Seoul 리전)
- [ ] Vercel 계정 + GitHub 연동
- [ ] 카카오 개발자 앱 (고객 로그인용)

## DB
- [ ] 마이그레이션 001~007 순서대로 실행
- [ ] Table Editor에서 테이블 7개(members, treatment_types, appointments, visit_history, push_subscriptions + 뷰 member_last_visit) 확인
- [ ] `visit-photos` Storage 버킷 존재 (public)

## 계정/권한
- [ ] Admin 계정 생성 (Auto Confirm)
- [ ] Admin에 `app_metadata.role = 'admin'` 부여
- [ ] Admin 재로그인 (JWT 갱신)

## 외부 연동
- [ ] 카카오 provider 활성화 (Supabase Auth) + Redirect URI
- [ ] VAPID 키 생성

## 환경변수 (Vercel)
- [ ] NEXT_PUBLIC_SUPABASE_URL / ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY (서버)
- [ ] NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT
- [ ] CRON_SECRET (서버)
- [ ] (선택) Sentry 변수

## 배포
- [ ] Vercel Import + Deploy 성공
- [ ] Cron 등록 확인 (Pro 플랜이면 매시간)

## 기능 점검
- [ ] Admin 로그인 → 대시보드(승인대기 배너)
- [ ] 회원 등록/검색/수정/삭제(소프트)
- [ ] 시술 종류 등록
- [ ] 예약 캘린더 등록/완료 → 시술내역 자동 생성
- [ ] 시술내역 편집(결제금액/사진 업로드)
- [ ] 통계 페이지 (월 이동/차트)
- [ ] 고객 카카오 로그인 → 온보딩(전화번호) → 마이페이지
- [ ] 고객 예약 신청 → Admin 승인 → 고객 확정 확인
- [ ] 24시간 전 취소/변경 동작
- [ ] PWA 홈화면 추가 (모바일/HTTPS)
- [ ] 푸시 구독 + 리마인더 수동 호출 테스트

## 보안 확인
- [ ] 서버 전용 키가 클라이언트 번들에 없음 (NEXT_PUBLIC_ 아님)
- [ ] `.env.local`이 git에 커밋 안 됨
- [ ] `pnpm audit` 취약점 점검
