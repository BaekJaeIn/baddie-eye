# Business Logic Model — bolt-7-stats-deploy

## 설계 결정 (사용자 답변)

| 질문 | 결정 |
|------|------|
| Q1 위치 | 별도 페이지 /admin/stats |
| Q2 기간 | 월 선택 (이전/다음 달) |
| Q3 지표 | 총매출+건수 / 시술별 / 재방문율 / 신규vs재방문 (전부) |
| Q4 차트 | recharts 라이브러리 |
| Q5 배포 | 가이드+체크리스트+README + Vercel/환경변수 정리 |

---

## 1. 통계 조회 플로우

```
[/admin/stats?month=YYYY-MM] Server Component
    |
    | 월 범위 계산 (해당 월 1일 00:00 ~ 다음 달 1일 00:00)
    v
[데이터 조회]
    | 1. 이번 달 visit_history + treatment_types(name) + member_id
    | 2. 방문 회원들의 최초 방문일 (전체 기간 MIN(visited_at) per member)
    v
[집계 (앱 레벨)]
    | - 총매출 = Σ price_paid, 건수 = count
    | - 시술별 매출 = group by treatment_name
    | - 신규/재방문 = 회원 최초방문이 이번 달이면 신규
    | - 재방문율 = 재방문 회원수 / 방문 회원수
    v
[StatsView (Client) — recharts 차트 렌더링]
```

데이터량이 적으므로(1인샵 월 단위) 앱에서 집계. 별도 DB 함수 불필요.

---

## 2. 지표 정의

### A. 총매출 + 방문 건수
```
총매출 = SUM(visit_history.price_paid)  [이번 달]
방문 건수 = COUNT(visit_history)
객단가 = 총매출 / 방문 건수 (건수 0이면 0)
```

### B. 시술별 매출
```
GROUP BY treatment_type_id
  → [{ name, count, revenue }]  내림차순
recharts 막대 차트 (시술명 × 매출)
```

### C. 재방문율
```
방문 회원 = DISTINCT member_id [이번 달]
재방문 회원 = 방문 회원 중 최초 방문일 < 이번 달 1일
재방문율 = 재방문 회원수 / 방문 회원수 × 100
```

### D. 신규 vs 재방문
```
신규 회원 = 방문 회원 중 최초 방문일 ∈ 이번 달
재방문 회원 = 나머지
recharts 파이/도넛 차트 (신규 N : 재방문 M)
```

> 최초 방문 판별: visit_history의 회원별 MIN(visited_at) 사용
> (members.first_visit_at은 수동 입력이라 신뢰도 낮을 수 있어 실제 시술 이력 기준)

---

## 3. 월 네비게이션

```
[← 이전 달]  2026년 6월  [다음 달 →]
- searchParams.month = 'YYYY-MM' (기본: 이번 달)
- 미래 달도 조회 가능(빈 데이터), 또는 이번 달까지 제한
```

---

## 4. 집계 유틸 (`lib/stats/aggregate.ts`)

```typescript
interface VisitRecord {
  member_id: string
  price_paid: number
  treatment_name: string
  visited_at: string
}

aggregateStats(
  visits: VisitRecord[],
  firstVisitByMember: Map<string, string>,
  monthStart: string,
): {
  totalRevenue: number
  visitCount: number
  avgPrice: number
  byTreatment: { name: string; count: number; revenue: number }[]
  newMembers: number
  returningMembers: number
  returnRate: number
}
```

순수 함수 — 단위 테스트 대상.

---

## 5. 차트 (recharts, Q4=B)

| 지표 | 차트 |
|------|------|
| 시술별 매출 | BarChart (가로 막대) |
| 신규 vs 재방문 | PieChart (도넛) |
| 총매출/건수/객단가/재방문율 | 숫자 카드 |

recharts는 'use client' 컴포넌트에서만 사용 (StatsCharts.tsx).

---

## 6. 배포 마무리 (Q5=A+B)

| 산출물 | 내용 |
|--------|------|
| `DEPLOYMENT.md` | Vercel 배포 단계 + 환경변수 전체 정리 + 마이그레이션 순서 |
| `aidlc-docs/.../deploy-checklist.md` | 배포 전 점검 체크리스트 |
| `README.md` 갱신 | 전체 기능/Bolt 완료 반영 |
| `.env.local.example` 점검 | 모든 환경변수 한곳에 (이미 누적) |
| `vercel.json` 점검 | crons 확인 |

> 마이그레이션 없음 (기존 visit_history 사용). recharts 의존성만 추가.
