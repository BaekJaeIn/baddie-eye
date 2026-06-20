# Code Generation Plan — bolt-3.5-visit-history

> 단일 진실 공급원. 각 단계 완료 시 [x] 체크.

## 단위 컨텍스트

| 항목 | 내용 |
|------|------|
| Unit | bolt-3.5-visit-history |
| 의존성 | Bolt 1(인증/셸/Sentry), Bolt 2(members), Bolt 3(appointments/treatments/완료액션) |
| NFR | Bolt 1/2/3 패턴 재사용으로 SKIP |
| 신규 영역 | Supabase Storage 업로드 |

---

## 실행 단계

### Step 1: DB 마이그레이션 + 타입
- [x] `supabase/migrations/004_visit_history_rls_view_storage.sql`
  - visit_history RLS 정책
  - member_last_visit 뷰
  - visit-photos Storage 버킷 + 정책 [SECURITY-06]
  - appointment_id 유니크 인덱스 [BR-VH-05]
- [x] `types/database.ts` — VisitHistory(이미 존재) + MemberLastVisit 뷰 타입 추가

### Step 2: 유틸 + 검증
- [x] `lib/visit/recommend.ts` — 재방문 D-day/상태 계산
- [x] `lib/visit/upload.ts` — 이미지 검증 + Storage 업로드
- [x] `lib/validations/visit.ts` — visitEditSchema

### Step 3: 예약 완료 → 자동 생성
- [x] `app/admin/(protected)/appointments/actions.ts` 수정
  - updateAppointmentStatusAction: 완료 시 visit_history 자동 생성 [BR-VH-01~06]

### Step 4: 시술 내역 편집
- [x] `app/admin/(protected)/visits/actions.ts` — updateVisitAction
- [x] `components/visits/PhotoUploader.tsx` — Storage 업로드
- [x] `components/visits/VisitEditForm.tsx`
- [x] `app/admin/(protected)/visits/[id]/edit/page.tsx`

### Step 5: 전체 시술 내역 목록
- [x] `components/members/Pagination.tsx` 수정 — basePath prop 일반화
- [x] `app/admin/(protected)/visits/page.tsx` — 전체 목록 + 페이지네이션

### Step 6: 재방문 권장 표시
- [x] `lib/visit/recommend.ts` (Step 2와 함께)
- [x] `components/visits/ReturnBadge.tsx`
- [x] `components/visits/VisitHistoryList.tsx`
- [x] `app/admin/(protected)/members/[id]/page.tsx` 수정 — 히스토리 + 재방문 섹션
- [x] `components/members/MemberCard.tsx` 수정 — ReturnBadge
- [x] `app/admin/(protected)/members/page.tsx` 수정 — member_last_visit 조인
- [x] `app/admin/(protected)/dashboard/page.tsx` 수정 — 재방문 권장 회원 목록

### Step 7: 사이드바
- [x] `components/admin/AdminSidebar.tsx` 수정 — "시술 내역" 추가

### Step 8: 테스트
- [x] `tests/unit/recommend.test.ts` — D-day/상태 계산
- [x] `tests/unit/visit.validation.test.ts`
- [x] `tests/unit/upload.test.ts` — 이미지 검증
- [x] `tests/e2e/visits.spec.ts` — 미인증 보호 + 목록 진입

### Step 9: 빌드/테스트 검증 + 문서
- [x] `pnpm test` + `pnpm build` 실제 실행
- [x] `aidlc-docs/construction/bolt-3.5-visit-history/code/code-summary.md`

---

## 요구사항 추적

| 요구사항 | 단계 |
|----------|------|
| 예약 완료 → 시술내역 자동생성 (Q3) | Step 3 |
| 회원별 히스토리 | Step 6 |
| 재방문 권장 (Q4, 3곳) | Step 6 |
| 결제금액/사진 보완 (Q1) | Step 4 |
| 사진 업로드 (Q3=B) | Step 2,4 |
| 전체 시술내역 (Q4=B) | Step 5 |

## 사용자 작업 (배포 시)
- Supabase SQL Editor에서 `004_*.sql` 실행
- **Storage**: 마이그레이션이 버킷/정책 생성. 안 되면 대시보드 Storage에서 'visit-photos' 버킷 수동 생성(public)

## 예상 규모
약 18개 파일 (신규 12 + 수정 6)
