# Baddie Eye — 속눈썹연장샵 회원관리 시스템

1인 운영 속눈썹연장샵을 위한 회원·예약·시술 관리 시스템.
**Admin 웹(데스크탑)** + **Member PWA(모바일)** 단일 코드베이스.

## 기술 스택

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend/DB**: Supabase (Postgres + Auth + Storage)
- **고객 인증**: Kakao OAuth
- **차트**: recharts
- **알림**: Web Push (VAPID) + Vercel Cron
- **에러 추적**: Sentry
- **테스트**: Vitest (단위) + Playwright (E2E)
- **배포**: Vercel + Supabase

## 기능 (전체 완료)

### Admin (데스크탑 웹)
- 회원 관리 — CRUD, 검색/필터, 소프트 삭제, 재방문 권장 배지
- 시술 종류 관리 — CRUD, 권장 재방문 주기
- 예약 관리 — 주간 캘린더, 등록/변경/취소, 고객 신청 승인/거절
- 시술 내역 — 예약 완료 시 자동 생성, 결제금액/사진 편집
- 매출 통계 — 월별 총매출/시술별/재방문율/신규vs재방문 (차트)
- 대시보드 — 재방문 권장 회원, 승인 대기 예약

### Member (모바일 PWA)
- 카카오 로그인 + 전화번호 회원 연결
- 마이페이지 — 등급/포인트/시술 히스토리/재방문 권장
- 예약 신청 (가용 슬롯) / 내 예약 / 24시간 전 취소·변경
- 웹푸시 예약 리마인더
- 홈 화면 추가 (PWA)

## 시작하기

### 1. 의존성 설치
```bash
pnpm install
```

### 2. 환경변수
```bash
cp .env.local.example .env.local
# Supabase URL/키 등 입력
```

### 3. DB 마이그레이션
Supabase SQL Editor에서 `supabase/migrations/001~007`을 순서대로 실행.
자세히는 [DEPLOYMENT.md](DEPLOYMENT.md) 참조.

### 4. 개발 서버
```bash
pnpm dev
# Admin:  http://localhost:3000/admin/login
# Member: http://localhost:3000/login
```

## 스크립트

| 명령 | 설명 |
|------|------|
| `pnpm dev` | 개발 서버 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest 단위 테스트 |
| `pnpm test:e2e` | Playwright E2E |

## 배포

[DEPLOYMENT.md](DEPLOYMENT.md) — Supabase + Vercel 배포 전체 절차 + 환경변수 정리.

## 개발 로드맵 (완료)

- [x] **Bolt 1**: 프로젝트 셋업, Admin 로그인
- [x] **Bolt 2**: Admin 회원 관리
- [x] **Bolt 3**: Admin 예약/시술 관리
- [x] **Bolt 3.5**: 시술 내역 (자동 생성, 재방문 권장)
- [x] **Bolt 4**: Member PWA (카카오 로그인, 마이페이지)
- [x] **Bolt 5**: Member 예약 기능 (신청/승인/취소)
- [x] **Bolt 6**: 웹푸시 알림 (예약 리마인더)
- [x] **Bolt 7**: 매출 통계 & 배포 마무리

## 설계 문서

`aidlc-docs/` — AI-DLC 워크플로우 산출물 (요구사항, 설계, 코드 요약, 셋업 가이드).
