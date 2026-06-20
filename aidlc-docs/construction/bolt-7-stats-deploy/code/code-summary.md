# Code Summary — bolt-7-stats-deploy

> 검증: 단위 테스트 86/86 통과, 프로덕션 빌드 성공 (27 라우트).
> SPEC.md 전체 로드맵 완료.

## 생성/수정 파일

### 의존성/유틸 (Step 1)
| 파일 | 상태 | 역할 |
|------|------|------|
| `package.json` | 수정 | recharts 추가 |
| `lib/stats/month.ts` | 생성 | 월 파싱/범위/이동/포맷 |
| `lib/stats/aggregate.ts` | 생성 | 집계 순수 함수 |

### 컴포넌트 (Step 2)
| 파일 | 상태 |
|------|------|
| `components/stats/StatCard.tsx` | 생성 (숫자 카드) |
| `components/stats/MonthNav.tsx` | 생성 (월 네비, Client) |
| `components/stats/StatsCharts.tsx` | 생성 (recharts BarChart+PieChart, Client) |

### 페이지/셸 (Step 3)
| 파일 | 상태 |
|------|------|
| `app/admin/(protected)/stats/page.tsx` | 생성 (조회+집계+렌더) |
| `components/admin/AdminSidebar.tsx` | 수정 ("통계" 메뉴) |

### 배포 문서 (Step 4)
| 파일 | 상태 |
|------|------|
| `DEPLOYMENT.md` | 생성 (배포 가이드 + 환경변수 전체) |
| `README.md` | 수정 (전체 기능/Bolt 완료) |
| `aidlc-docs/.../deploy-checklist.md` | 생성 |

### 테스트 (Step 5)
| 파일 | 케이스 |
|------|--------|
| `tests/unit/aggregate.test.ts` | 5 |
| `tests/unit/month.test.ts` | 6 |
| `tests/e2e/stats.spec.ts` | 1 |

## 라우트 (신규)

```
/admin/stats   월별 매출 통계 (카드 + recharts 차트)
```

## 핵심 로직

| 지표 | 구현 |
|------|------|
| 총매출/건수/객단가 | aggregateStats 순수함수 |
| 시술별 매출 | group by treatment_name, 내림차순 막대그래프 |
| 신규 vs 재방문 | 회원 최초 방문일(visit_history MIN)로 판별, 도넛 |
| 재방문율 | 재방문/방문 회원 × 100 |
| 월 선택 | searchParams.month + MonthNav |

## 검증 결과

- ✅ 단위 테스트 86/86 통과 (Bolt1~6: 75 + Bolt7: 11)
- ✅ 프로덕션 빌드 성공 (27 라우트 + 미들웨어)
- ✅ TypeScript strict + ESLint 통과
- ✅ recharts SSR 정상 (Client 컴포넌트 격리)

## 사용자 작업 (배포 시)

- [DEPLOYMENT.md](../../../../DEPLOYMENT.md) 전체 절차 (마이그레이션 없음 — 기존 visit_history 사용)

## SPEC.md 전체 완료

| Bolt | 기능 | 상태 |
|------|------|------|
| 1 | 셋업 + Admin 로그인 | ✅ |
| 2 | 회원 관리 | ✅ |
| 3 | 예약/시술 관리 | ✅ |
| 3.5 | 시술 내역 | ✅ |
| 4 | Member PWA | ✅ |
| 5 | Member 예약 | ✅ |
| 6 | 웹푸시 알림 | ✅ |
| 7 | 매출 통계 & 배포 | ✅ |
