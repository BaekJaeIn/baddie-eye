# Baddie Eye — 속눈썹연장샵 회원관리 시스템

1인 운영 속눈썹연장샵을 위한 회원·예약·시술 관리 시스템.
**Admin 웹(데스크탑)** + **태블릿 동의서 앱(매장 키오스크)** 단일 코드베이스.

## 기술 스택

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend/DB**: Supabase (Postgres + Auth + Storage)
- **차트**: recharts
- **알림**: Web Push (VAPID) — 원장 알림
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

### 태블릿 동의서 앱 (매장 키오스크)
- 관리자(원장) 세션으로 운영 — 매장 태블릿에 띄워두고 사용
- 회원 선택 — 이름/전화번호로 검색해 등록된 회원 선택 (신규는 관리자 앱에서 먼저 등록)
- 규약 표시 — 시술 동의 + 개인정보 수집·이용 동의서 (샘플 문구, 버전 관리)
- 동의/거부 기록 — `consents` 테이블에 회원·버전·동의여부·시각 저장
- 라우트: `/tablet` → `/tablet/[memberId]` → `/tablet/complete`

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
Supabase SQL Editor에서 `supabase/migrations/001~011`을 순서대로 실행.
자세히는 [DEPLOYMENT.md](DEPLOYMENT.md) 참조.

### 4. 개발 서버
```bash
pnpm dev
# Admin:   http://localhost:3000/admin/login
# 태블릿:  http://localhost:3000/tablet  (관리자 로그인 필요)
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

## 개발 로드맵

- [x] **Bolt 1**: 프로젝트 셋업, Admin 로그인
- [x] **Bolt 2**: Admin 회원 관리
- [x] **Bolt 3**: Admin 예약/시술 관리
- [x] **Bolt 3.5**: 시술 내역 (자동 생성, 재방문 권장)
- [x] **Bolt 7**: 매출 통계 & 배포 마무리
- [x] **태블릿 동의서 앱**: 매장 키오스크에서 규약 동의 받기

> 고객용 PWA(카카오 로그인·마이페이지·고객 예약·웹푸시 리마인더)는 제거되었습니다.
> 관련 DB 구성은 `010_remove_member_app.sql`로 admin 전용 RLS로 되돌렸습니다.
> (원장 푸시 알림용 `push_subscriptions`는 유지)

## 설계 문서

`aidlc-docs/` — AI-DLC 워크플로우 산출물 (요구사항, 설계, 코드 요약, 셋업 가이드).
