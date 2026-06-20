# Frontend Components — bolt-7-stats-deploy

## 파일 구조

```
app/admin/(protected)/stats/
└── page.tsx                  # 통계 페이지 (월 선택 + 집계 + 차트)

components/stats/
├── StatCard.tsx              # 숫자 카드 (Server)
├── StatsCharts.tsx           # recharts 차트 (Client)
└── MonthNav.tsx              # 월 네비게이션 (Client)

lib/stats/
├── aggregate.ts              # 집계 순수 함수
└── month.ts                  # 월 범위/포맷 유틸

components/admin/AdminSidebar.tsx  # (수정) "통계" 메뉴

DEPLOYMENT.md                 # (신규) 배포 가이드
README.md                     # (수정) 전체 기능 반영
package.json                  # (수정) recharts 추가
```

---

## StatsPage (`stats/page.tsx`)

| 항목 | 내용 |
|------|------|
| 유형 | Server Component |
| Props | `searchParams: { month? }` |
| 책임 | 월 데이터 조회 → aggregate → 카드 + 차트 렌더 |

```
1. month = searchParams.month ?? 현재월 (YYYY-MM, 검증)
2. 월 범위 visit_history 조회 (member_id, price_paid, visited_at, treatment_types(name))
3. 방문 회원들의 최초 방문일 조회 (MIN per member)
4. aggregateStats(...) → 지표
5. 렌더:
   <MonthNav month={} />
   <StatCard 총매출 /> <StatCard 방문건수 /> <StatCard 객단가 /> <StatCard 재방문율 />
   <StatsCharts byTreatment={} newVsReturning={} />
```

---

## MonthNav (`components/stats/MonthNav.tsx`)
- Client. [← 이전] YYYY년 M월 [다음 →]
- router.push(`/admin/stats?month=YYYY-MM`)
- `data-testid`: `month-prev`, `month-next`, `month-label`

## StatCard (`components/stats/StatCard.tsx`)
- Server. Props: label, value, sub?
- 숫자 카드 (총매출/건수/객단가/재방문율)
- `data-testid="stat-card"`

## StatsCharts (`components/stats/StatsCharts.tsx`)
- **Client** ('use client', recharts)
- Props: `byTreatment: {name,revenue}[]`, `newCount`, `returningCount`
- BarChart (시술별 매출) + PieChart (신규 vs 재방문)
- 데이터 없으면 안내 텍스트 [BR-CH-02]
- `data-testid="stats-charts"`

---

## 집계 유틸 (`lib/stats/aggregate.ts`)

```typescript
export interface VisitRecord {
  member_id: string
  price_paid: number
  treatment_name: string
}
export interface StatsResult {
  totalRevenue: number
  visitCount: number
  avgPrice: number
  byTreatment: { name: string; count: number; revenue: number }[]
  newMembers: number
  returningMembers: number
  returnRate: number
}
export function aggregateStats(
  visits: VisitRecord[],
  isNewMember: (memberId: string) => boolean,
): StatsResult
```
순수 함수 — 단위 테스트.

## 월 유틸 (`lib/stats/month.ts`)

```typescript
export function parseMonth(s?: string): string  // 'YYYY-MM' 검증/폴백
export function monthRange(month: string): { start: string; end: string }
export function shiftMonth(month: string, delta: number): string
export function formatMonth(month: string): string  // '2026년 6월'
```

---

## 사이드바 수정
`AdminSidebar.tsx` navItems에 추가:
```typescript
{ label: '통계', href: '/admin/stats' },
```
순서: 대시보드 → 회원 → 예약 → 시술 종류 → 시술 내역 → 통계

---

## 배포 문서

### DEPLOYMENT.md
- 사전 준비 (Supabase, Vercel, 카카오)
- 마이그레이션 001~007 순서
- 환경변수 전체 표 (이름 / 노출범위 / 출처)
- Admin role 부여
- Vercel 배포 단계
- 배포 후 점검

### deploy-checklist.md (aidlc-docs)
- [ ] 마이그레이션 전체 실행
- [ ] 환경변수 등록
- [ ] Admin role 부여
- [ ] 카카오 provider
- [ ] VAPID/Cron
- [ ] PWA 설치 확인
- [ ] 푸시 동작 확인

### README.md 갱신
- 7개 Bolt 전체 완료 체크
- 기능 요약
- 로컬 실행 + 배포 링크
