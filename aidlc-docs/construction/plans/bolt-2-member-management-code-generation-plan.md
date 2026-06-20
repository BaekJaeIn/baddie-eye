# Code Generation Plan — bolt-2-member-management

> 단일 진실 공급원. 각 단계 완료 시 [x] 체크.

## 단위 컨텍스트

| 항목 | 내용 |
|------|------|
| Unit | bolt-2-member-management |
| 유형 | 기존 프로젝트에 기능 추가 (Bolt 1 패턴 재사용) |
| 의존성 | Bolt 1: Supabase 클라이언트, 미들웨어, AdminLayout, Sentry |
| 코드 위치 | 워크스페이스 루트 |

## NFR 스킵 근거
NFR Requirements/Design은 Bolt 1에서 확립한 동일 기술 스택(Next.js/Zod/Supabase/Sentry)과 보안 패턴(미들웨어 보호, Zod 검증, generic 에러, RLS)을 그대로 재사용하므로 생략 (사용자 승인).

---

## 실행 단계

### Step 1: DB 마이그레이션 (소프트 삭제 + RLS)
- [x] `supabase/migrations/002_member_soft_delete_and_rls.sql`
  - `members.is_active` 컬럼 추가 [BR-MEM-11]
  - `idx_members_is_active`, `idx_members_name` 인덱스
  - `members` RLS 정책: authenticated 전체 접근 [SECURITY-06]
- [x] `types/database.ts` — Member에 `is_active` 추가

### Step 2: 검증 스키마
- [x] `lib/validations/member.ts` — Zod memberSchema [SECURITY-05]
- [x] `lib/format.ts` — 전화번호 정규화/포맷 유틸

### Step 3: Server Actions
- [x] `app/admin/(protected)/members/actions.ts`
  - createMemberAction, updateMemberAction, deleteMemberAction(소프트)
  - 전화번호 UNIQUE 위반 → generic 에러 [SECURITY-09]

### Step 4: 회원 목록
- [x] `app/admin/(protected)/members/page.tsx` — 검색/필터/페이지네이션 조회
- [x] `components/members/MemberSearchBar.tsx`
- [x] `components/members/MemberCard.tsx`
- [x] `components/members/TierBadge.tsx`
- [x] `components/members/Pagination.tsx`

### Step 5: 회원 등록/수정
- [x] `components/members/MemberForm.tsx` — 등록/수정 공용 폼
- [x] `app/admin/(protected)/members/new/page.tsx`
- [x] `app/admin/(protected)/members/[id]/edit/page.tsx`

### Step 6: 회원 상세 + 삭제
- [x] `app/admin/(protected)/members/[id]/page.tsx`
- [x] `components/members/DeleteMemberButton.tsx`

### Step 7: 사이드바 메뉴 추가
- [x] `components/admin/AdminSidebar.tsx` 수정 — "회원 관리" 항목 (in-place)

### Step 8: 테스트
- [x] `tests/unit/member.validation.test.ts` — memberSchema 검증
- [x] `tests/unit/format.test.ts` — 전화번호 포맷 유틸
- [x] `tests/e2e/member-management.spec.ts` — 목록/등록/검색 E2E

### Step 9: 빌드/테스트 검증 + 문서
- [x] `pnpm test` + `pnpm build` 실제 실행 검증
- [x] `aidlc-docs/construction/bolt-2-member-management/code/code-summary.md`

---

## 요구사항 추적

| 요구사항 | 단계 |
|----------|------|
| 회원 목록 (카드/검색/필터/페이지네이션) | Step 4 |
| 회원 등록 | Step 3, 5 |
| 회원 수정 | Step 3, 5 |
| 회원 소프트 삭제 | Step 1, 3, 6 |
| 회원 상세 | Step 6 |

## 사용자 작업 (배포 시)
- Supabase SQL Editor에서 `002_member_soft_delete_and_rls.sql` 실행

## 예상 규모
- 약 16개 파일 (신규 15 + 수정 1: AdminSidebar)
