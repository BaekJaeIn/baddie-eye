# 속눈썹연장샵 회원관리 시스템 — 기획 문서 (SPEC)

> AI-DLC Inception 단계 산출물. 이 문서를 프로젝트 루트에 두고 Claude Code에서 Construction(구현) 단계의 컨텍스트로 사용한다.

> ⚠️ **계획 변경 (2026-06-29)**: 고객용 PWA(Member 앱 — 카카오 로그인, 마이페이지,
> 고객 예약, 웹푸시 리마인더)는 폐기되었다. 대신 매장에서 관리자(원장)가 운영하는
> **태블릿 동의서 앱**(`/tablet`)을 추가했다. 태블릿에서는 등록된 회원을 선택해
> 규약(시술·개인정보 동의서)을 보여주고 동의/거부를 받아 `consents` 테이블에 기록한다.
> 따라서 아래 2-2(Member PWA)·로드맵의 Bolt 4~6 내용은 더 이상 적용되지 않는다.
> 회원 관리(Admin)와 members 테이블은 그대로 유지된다.

## 1. 개요

- **목적**: 1인 운영 속눈썹연장샵의 회원/예약/시술 관리를 자동화하고, 고객에게는 별도 앱 설치 없이 쓸 수 있는 모바일 웹앱(PWA)을 제공한다.
- **사용자 역할**
  - **Admin (원장)**: 노트북 브라우저로 접속, 회원·예약·매출 관리
  - **Member (고객)**: 모바일 브라우저로 접속, 링크 또는 홈화면 아이콘으로 PWA 사용
- **플랫폼**: 단일 코드베이스(Next.js)에서 `/admin` 라우트와 일반 고객용 라우트를 분리해서 제공. 별도의 네이티브 앱 빌드/배포(앱스토어 심사 등)는 하지 않는다.

## 2. 핵심 기능

### 2-1. Admin (관리자 웹, 데스크탑 우선)

- 회원 등록/조회/수정/삭제: 이름, 연락처, 생일, 첫방문일, 알러지/주의사항 메모
- 예약 관리: 캘린더 뷰, 예약 등록·변경·취소, 시술 종류별 소요시간 설정
- 시술 내역: 회원별 시술 히스토리, 마지막 시술일 기준 재방문 권장 시점 표시
- 멤버십/포인트: 등급(예: 일반/단골/VIP), 누적 결제액, 포인트 적립·차감
- 매출 통계: 기간별/시술별 매출, 재방문율, 신규 vs 재방문 비율
- 알림 발송: 예약 전 리마인더, 재방문 권유 메시지 (1차는 수동 발송, 이후 자동화)

### 2-2. Member (고객용 PWA, 모바일 우선)

- 로그인: 카카오 소셜 로그인 권장 (비밀번호 관리 부담 없음, 한국 사용자 친화적)
- 마이페이지: 내 시술 히스토리, 포인트/등급 확인
- 예약: 가능한 시간대 확인 후 예약 신청, 예약 변경/취소
- 알림 수신: 예약 전 리마인더 (1차는 웹푸시, 추후 카카오 알림톡 확장 검토)
- 홈화면 추가(Add to Home Screen)로 앱처럼 사용 가능

### 2-3. 1차 MVP 범위 (제안)

아래는 제안이며, Bolt 1 시작 전에 확정하면 된다.

- **포함**: 회원 CRUD, 예약 캘린더, 시술 내역, 고객 로그인 + 마이페이지 + 예약 신청
- **보류 가능**: 포인트/멤버십 등급 자동화, 매출 통계 고도화, 카카오 알림톡(사업자 인증 필요), 결제 연동

## 3. 데이터 모델 (초안)

| 테이블            | 주요 필드                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| `members`         | id, name, phone, birthday, first_visit_at, allergy_note, membership_tier, points, created_at     |
| `treatment_types` | id, name(예: 자연눈썹 1set, 볼륨 2set), duration_min, base_price                                 |
| `appointments`    | id, member_id, treatment_type_id, scheduled_at, status(예약/완료/취소), memo                     |
| `visit_history`   | id, member_id, appointment_id, treatment_type_id, visited_at, price_paid, before_after_photo_url |
| `admin_users`     | id, email, password_hash (또는 Supabase Auth 사용 시 생략 가능)                                  |

관계: `members 1:N appointments`, `members 1:N visit_history`, `treatment_types 1:N appointments`

## 4. 추천 기술 스택

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS
- **Backend/DB**: Supabase (Postgres + Auth + Storage) — 별도 서버 운영 부담 없이 인증·DB·이미지 저장을 한번에 처리
- **고객 로그인**: Kakao OAuth (Supabase Auth 커스텀 OAuth 또는 NextAuth + Kakao Provider)
- **PWA**: `next-pwa` 또는 수동 manifest.json + service worker 설정으로 홈화면 추가 지원
- **알림**: 1차는 Web Push API, 추후 카카오 알림톡(비즈메시지 API 제공업체 연동, 카카오톡 채널/사업자 인증 필요)
- **배포**: Vercel(프론트엔드) + Supabase(백엔드/DB), 이후 커스텀 도메인 연결

## 5. 개발 로드맵 (AI-DLC Bolt 단위)

1. **Bolt 1 — 프로젝트 셋업**: Next.js 프로젝트 생성, Supabase 연결, 환경변수/스키마 마이그레이션, Admin 로그인 구현
2. **Bolt 2 — Admin 회원 관리**: 회원 CRUD, 회원 목록/검색 화면
3. **Bolt 3 — Admin 예약/시술 관리**: 예약 캘린더, 시술 종류 관리, 시술 내역 기록
4. **Bolt 4 — Member PWA 기본**: 카카오 로그인, 마이페이지(히스토리/포인트 조회)
5. **Bolt 5 — Member 예약 기능**: 예약 가능 시간 조회, 예약 신청/취소
6. **Bolt 6 — 알림**: 예약 리마인더(웹푸시) 구현
7. **Bolt 7 — 매출 통계 & 배포 마무리**: 대시보드 통계, Vercel 배포, 도메인 연결, PWA manifest 최종 점검

각 Bolt는 며칠~1주 내로 끝낼 수 있는 크기를 유지하고, 끝날 때마다 실제로 써보면서 다음 Bolt 범위를 조정한다.

## 6. 확인이 필요한 결정 사항 (Open Questions)

- 결제/매출 기록을 수동 입력으로 할지, PG 연동(카드 결제)까지 할지
- 이건 일단 수동으로 하고, 나중에 pg연동 할 수도 있음
- 카카오 알림톡까지 갈지, 초반엔 웹푸시/수동 알림으로 충분할지
- 일단 지금은 후자로 해줘
- 고객 PWA에 예약 가능 "시간대"를 어떻게 정의할지 (원장 1인이라 동시 예약 슬롯 1개로 단순화 가능)
- 이건 알아서 해줘

## 7. Claude Code 활용 방법

1. 이 파일을 프로젝트 루트에 `SPEC.md`로 저장
2. 터미널에서 프로젝트 폴더로 이동 후 `claude` 실행
3. "SPEC.md 읽고 Bolt 1부터 시작하자" 라고 요청 → Claude Code가 프로젝트 구조를 제안하고, 확인 후 진행
4. 매 Bolt마다 작은 단위로 구현 → 직접 실행해보고 확인 → 다음 Bolt로 이동
