# Code Generation Plan — bolt-4-member-pwa

> 단일 진실 공급원. 각 단계 완료 시 [x] 체크.

## 단위 컨텍스트

| 항목 | 내용 |
|------|------|
| Unit | bolt-4-member-pwa |
| 의존성 | Bolt 1~3.5 (인증/members/visit_history/format/Sentry) |
| NFR | 패턴 재사용 SKIP |
| 신규 영역 | 카카오 OAuth, PWA, RLS 재설계 |

---

## 실행 단계

### Step 1: DB 마이그레이션 + 타입
- [x] `supabase/migrations/005_member_user_link_and_rls.sql`
  - members.user_id 컬럼(UNIQUE, auth.users 참조) + 인덱스
  - members/visit_history RLS를 admin-or-owner로 교체 [BR-RLS-01~04]
- [x] `types/database.ts` — Member에 user_id 추가

### Step 2: 검증 + CSP
- [x] `lib/validations/onboarding.ts` — Zod 전화번호 스키마
- [x] `next.config.mjs` 수정 — img-src에 카카오 CDN 추가

### Step 3: OAuth 콜백 + 미들웨어
- [x] `app/auth/callback/route.ts` — code → 세션 교환
- [x] `middleware.ts` 수정 — /me, /onboarding 보호 추가

### Step 4: 고객 로그인
- [x] `app/(member)/layout.tsx` — 고객 셸
- [x] `app/(member)/login/page.tsx`
- [x] `components/member/KakaoLoginButton.tsx`

### Step 5: 온보딩 (회원 연결)
- [x] `app/(member)/onboarding/actions.ts` — connectMemberAction [BR-MB-04~06]
- [x] `app/(member)/onboarding/page.tsx`
- [x] `components/member/OnboardingForm.tsx`

### Step 6: 마이페이지
- [x] `app/(member)/me/page.tsx` — 정보 + 히스토리 + 재방문
- [x] `app/(member)/me/actions.ts` — logoutMemberAction
- [x] `components/member/MemberHeader.tsx`
- [x] `components/member/MyVisitHistory.tsx`

### Step 7: PWA
- [x] `public/manifest.json`
- [x] `public/sw.js` — 최소 service worker
- [x] `public/icon-192.png`, `public/icon-512.png` — placeholder 아이콘
- [x] `components/pwa/ServiceWorkerRegister.tsx`
- [x] `app/layout.tsx` 수정 — manifest/메타/SW 등록

### Step 8: 테스트
- [x] `tests/unit/onboarding.validation.test.ts`
- [x] `tests/e2e/member.spec.ts` — 미인증 보호 + 로그인 페이지

### Step 9: 빌드/테스트 검증 + 문서
- [x] `pnpm test` + `pnpm build` 실제 실행
- [x] `aidlc-docs/construction/bolt-4-member-pwa/code/code-summary.md`
- [x] `aidlc-docs/construction/bolt-4-member-pwa/code/kakao-setup-guide.md` — 카카오/Supabase 설정 가이드

---

## 요구사항 추적

| 요구사항 | 단계 |
|----------|------|
| FR-08 카카오 로그인 | Step 3,4 |
| 회원 연결 (Q1/Q2) | Step 5 |
| FR-09 마이페이지 | Step 6 |
| FR-12 PWA | Step 7 |
| RLS 재설계 | Step 1 |

## 사용자 작업 (배포 시)
- 마이그레이션 005 실행
- **Admin 계정에 role 부여**: `UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}' WHERE email='...'`
- **카카오 개발자 콘솔**: 앱 생성 → REST API 키 → Redirect URI 등록
- **Supabase Auth**: Kakao provider 활성화 + 키 입력
- PWA 아이콘을 실제 로고로 교체 (선택)

## 예상 규모
약 22개 파일 (신규 19 + 수정 3: middleware/next.config/layout/types)
