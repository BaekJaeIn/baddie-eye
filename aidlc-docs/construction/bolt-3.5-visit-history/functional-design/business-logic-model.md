# Business Logic Model — bolt-3.5-visit-history

## 설계 결정 (사용자 답변)

| 질문 | 결정 |
|------|------|
| Q1 결제금액/사진 보완 | 시술 내역 전용 편집 페이지 (`/admin/visits/[id]/edit`) |
| Q2 재방문 권장 표시 | 회원 상세 + 회원 목록 카드 + 대시보드 (모두) |
| Q3 사진 업로드 | Supabase Storage 업로드 |
| Q4 전체 시술 내역 화면 | 추가 (`/admin/visits`) |

---

## 1. 예약 완료 → 시술 내역 자동 생성 (Q3=A 흐름)

Bolt 3의 `updateAppointmentStatusAction(id, 'completed')`를 확장:

```
[예약 완료 처리]
    |
    | 1. 예약 정보 조회 (member_id, treatment_type_id, scheduled_at)
    | 2. 시술 종류 base_price 조회
    | 3. appointments.status = 'completed' 업데이트
    | 4. visit_history insert:
    |    - member_id, appointment_id, treatment_type_id
    |    - visited_at = scheduled_at
    |    - price_paid = treatment.base_price  (나중에 보완 가능)
    |    - before_after_photo_url = null
    | 5. 중복 방지: appointment_id로 이미 생성된 내역 있으면 skip
    v
[완료 + 시술 내역 생성됨]
```

**원자성 주의**: Supabase 단일 트랜잭션이 어려우므로, 상태 업데이트 성공 후
visit_history insert. insert 실패 시 Sentry 기록 (상태는 완료로 유지, 내역은
편집 화면에서 수동 보완 가능). appointment_id 유니크성으로 중복 생성 방지.

---

## 2. 재방문 권장 계산 (Q4=B 로직)

**Postgres 뷰 `member_last_visit`** (마이그레이션 004):

```sql
CREATE VIEW member_last_visit AS
SELECT DISTINCT ON (vh.member_id)
  vh.member_id,
  vh.visited_at,
  vh.treatment_type_id,
  tt.name AS treatment_name,
  tt.recommended_interval_days,
  CASE WHEN tt.recommended_interval_days IS NOT NULL
       THEN (vh.visited_at AT TIME ZONE 'Asia/Seoul')::date
            + tt.recommended_interval_days
       ELSE NULL END AS recommended_return_date
FROM visit_history vh
JOIN treatment_types tt ON tt.id = vh.treatment_type_id
ORDER BY vh.member_id, vh.visited_at DESC;
```

- 회원별 **가장 최근** 시술 1건 (DISTINCT ON)
- 권장 재방문일 = 마지막 시술일 + 시술별 권장주기
- 권장주기 미설정(null)이면 권장일 없음

**D-day 계산 (앱 레벨, `lib/visit/recommend.ts`)**:
```
D-day = recommended_return_date - today
- D-day < 0  : 경과 (지남) — 빨강
- 0 ≤ D-day ≤ 7 : 임박 — 주황
- D-day > 7  : 여유 — 표시 안 하거나 회색
```

---

## 3. 표시 위치 (Q2=A,B,C)

| 위치 | 데이터 | 표시 |
|------|--------|------|
| 회원 상세 | member_last_visit 단건 | "마지막 시술 / 권장 재방문 D-day" |
| 회원 목록 카드 | member_last_visit 조인 | 임박/경과 시 배지 |
| 대시보드 | recommended_return_date가 이번 주 범위 또는 경과 | 재방문 권장 회원 목록 |

---

## 4. 시술 내역 보완 플로우 (Q1=B, Q3=B)

```
[/admin/visits/[id]/edit] 편집 페이지
    | 결제금액 수정 (price_paid)
    | before/after 사진 업로드 (Supabase Storage)
    v
[사진 업로드: Supabase Storage]
    | 1. 클라이언트: 파일 선택 → 검증(타입/크기) [SECURITY-05]
    | 2. Storage 버킷 'visit-photos'에 업로드
    |    경로: {member_id}/{visit_id}-{timestamp}.{ext}
    | 3. 공개 URL 획득
    v
[updateVisitAction]
    | price_paid, before_after_photo_url 업데이트
    v
[저장 완료]
```

---

## 5. 전체 시술 내역 목록 (Q4=B)

```
[/admin/visits?page=N] 전체 시술 내역
    | visit_history 조회 (회원명, 시술명 조인)
    | ORDER BY visited_at DESC
    | 페이지네이션 (20건)
    v
[테이블: 날짜 / 회원 / 시술 / 결제금액 / 편집]
```

매출 통계(Bolt 7)의 데이터 소스가 됨.

---

## 6. 스키마 변경 (마이그레이션 004)

```sql
-- visit_history RLS 정책
ALTER ... CREATE POLICY authenticated full access on visit_history;

-- 회원별 마지막 시술 뷰
CREATE VIEW member_last_visit AS ...;

-- Storage 버킷 + 정책
INSERT INTO storage.buckets (id, name, public) VALUES ('visit-photos', 'visit-photos', true);
CREATE POLICY ... ON storage.objects (authenticated insert/select on visit-photos);

-- visit_history.appointment_id 유니크 (중복 자동생성 방지)
CREATE UNIQUE INDEX idx_visit_history_appointment
  ON visit_history (appointment_id) WHERE appointment_id IS NOT NULL;
```
