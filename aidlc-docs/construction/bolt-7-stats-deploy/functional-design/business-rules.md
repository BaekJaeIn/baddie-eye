# Business Rules — bolt-7-stats-deploy

## 통계 집계 규칙

| ID | 규칙 |
|----|------|
| BR-ST-01 | 집계 대상은 visit_history (시술 완료 기록) |
| BR-ST-02 | 월 범위: 해당 월 1일 00:00 ~ 다음 달 1일 00:00 (로컬) |
| BR-ST-03 | 총매출 = Σ price_paid, 방문건수 = row count |
| BR-ST-04 | 객단가 = 총매출 / 방문건수 (0건이면 0) |
| BR-ST-05 | 시술별 매출 = treatment_type별 합계, 매출 내림차순 |
| BR-ST-06 | 회원 최초 방문 = 그 회원의 전체 visit_history 중 MIN(visited_at) |
| BR-ST-07 | 신규 회원 = 최초 방문일이 조회 월 범위 내 |
| BR-ST-08 | 재방문 회원 = 방문 회원 중 신규가 아닌 회원 |
| BR-ST-09 | 재방문율 = 재방문 회원수 / 방문 회원수 × 100 (방문 0이면 0%) |
| BR-ST-10 | 삭제된 시술(treatment_types 없음)은 "기타"로 집계 |

---

## 권한 규칙 [SECURITY-08]

| ID | 규칙 |
|----|------|
| BR-ST-20 | /admin/stats는 미들웨어 인증 강제 (Admin) |
| BR-ST-21 | visit_history RLS(admin-or-owner)로 Admin은 전체 조회 (role=admin) |

---

## 차트 규칙 [Q4=B recharts]

| ID | 규칙 |
|----|------|
| BR-CH-01 | recharts 컴포넌트는 'use client'에서만 |
| BR-CH-02 | 데이터 없으면 "데이터가 없습니다" 표시 (빈 차트 방지) |
| BR-CH-03 | 금액은 천 단위 구분 표시 (toLocaleString) |
| BR-CH-04 | CSP: recharts는 인라인 스타일 사용 — style-src 'unsafe-inline' 이미 허용됨 |

---

## 배포 규칙 [Q5=A+B]

| ID | 규칙 |
|----|------|
| BR-DP-01 | 마이그레이션 실행 순서: 001 → 002 → ... → 007 |
| BR-DP-02 | 환경변수는 Vercel 대시보드에 등록 (서버 전용 키는 NEXT_PUBLIC_ 금지) |
| BR-DP-03 | Admin 계정 role='admin' 부여 필수 (Bolt 4 RLS) |
| BR-DP-04 | 카카오/VAPID 설정은 각 setup-guide 참조 |
| BR-DP-05 | 배포 후 PWA 설치/푸시 동작 확인 |

---

## 의존성

| 항목 | 내용 |
|------|------|
| recharts | 차트 라이브러리 (package.json 추가) |
| 마이그레이션 | 없음 (기존 visit_history 사용) |

---

## 입력 검증 [SECURITY-05]

| 항목 | 규칙 |
|------|------|
| month 파라미터 | YYYY-MM 형식 검증, 잘못되면 이번 달로 폴백 |
