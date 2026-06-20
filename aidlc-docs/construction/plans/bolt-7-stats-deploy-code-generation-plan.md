# Code Generation Plan — bolt-7-stats-deploy

> 단일 진실 공급원. 각 단계 완료 시 [x] 체크.

## 단위 컨텍스트

| 항목 | 내용 |
|------|------|
| Unit | bolt-7-stats-deploy |
| 의존성 | Bolt 3.5(visit_history), Admin 셸 |
| NFR | 패턴 재사용 SKIP |
| 신규 | recharts. 마이그레이션 없음 |

---

## 실행 단계

### Step 1: 의존성 + 집계 유틸
- [x] `package.json` 수정 — recharts 추가
- [x] `lib/stats/month.ts` — parseMonth, monthRange, shiftMonth, formatMonth
- [x] `lib/stats/aggregate.ts` — aggregateStats 순수 함수

### Step 2: 통계 컴포넌트
- [x] `components/stats/StatCard.tsx` — 숫자 카드
- [x] `components/stats/MonthNav.tsx` — 월 네비게이션 (Client)
- [x] `components/stats/StatsCharts.tsx` — recharts 차트 (Client)

### Step 3: 통계 페이지 + 사이드바
- [x] `app/admin/(protected)/stats/page.tsx` — 조회 + 집계 + 렌더
- [x] `components/admin/AdminSidebar.tsx` 수정 — "통계" 메뉴

### Step 4: 배포 마무리 문서
- [x] `DEPLOYMENT.md` — 배포 가이드 + 환경변수 전체 정리 + 마이그레이션 순서
- [x] `README.md` 수정 — 전체 기능/Bolt 완료 반영
- [x] `aidlc-docs/construction/bolt-7-stats-deploy/code/deploy-checklist.md`

### Step 5: 테스트
- [x] `tests/unit/aggregate.test.ts` — 집계 로직
- [x] `tests/unit/month.test.ts` — 월 유틸
- [x] `tests/e2e/stats.spec.ts` — 미인증 보호

### Step 6: 빌드/테스트 검증 + 문서
- [x] `pnpm test` + `pnpm build` 실제 실행
- [x] `aidlc-docs/construction/bolt-7-stats-deploy/code/code-summary.md`

---

## 요구사항 추적

| 요구사항 | 단계 |
|----------|------|
| FR-06 매출 통계 (총매출/시술별/재방문율/신규) | Step 1,2,3 |
| 차트 (recharts) | Step 2 |
| 배포 마무리 | Step 4 |

## 사용자 작업 (배포 시)
- DEPLOYMENT.md 따라 진행 (마이그레이션 001~007, 환경변수, Admin role, 카카오/VAPID)

## 예상 규모
약 13개 파일 (신규 10 + 수정 3: package/sidebar/README)
