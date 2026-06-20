# Business Rules — bolt-3.5-visit-history

## 시술 내역 자동 생성 규칙

| ID | 규칙 |
|----|------|
| BR-VH-01 | 예약이 'completed'로 전환될 때만 시술 내역 자동 생성 |
| BR-VH-02 | visited_at = 예약의 scheduled_at |
| BR-VH-03 | price_paid 초기값 = 시술 종류 base_price |
| BR-VH-04 | before_after_photo_url 초기값 = null |
| BR-VH-05 | 동일 appointment_id로 이미 시술 내역 있으면 중복 생성 안 함 (유니크 인덱스) |
| BR-VH-06 | 자동 생성 실패해도 예약 완료 상태는 유지 (Sentry 기록, 수동 보완) |

---

## 시술 내역 편집 규칙

| ID | 필드 | 규칙 | 에러 메시지 |
|----|------|------|-------------|
| BR-VH-10 | price_paid | 0 이상 정수 | "결제금액은 0 이상이어야 합니다" |
| BR-VH-11 | before_after_photo_url | 선택, 유효 URL 또는 null | — |
| BR-VH-12 | visited_at | 수정 가능 (사후 보정), 유효 날짜시간 | — |

---

## 사진 업로드 규칙 [SECURITY-05]

| ID | 규칙 |
|----|------|
| BR-IMG-01 | 허용 확장자: jpg, jpeg, png, webp |
| BR-IMG-02 | 최대 크기: 5MB |
| BR-IMG-03 | 업로드 경로: `visit-photos/{member_id}/{visit_id}-{timestamp}.{ext}` |
| BR-IMG-04 | 클라이언트 + 서버(스토리지 정책) 이중 검증 |
| BR-IMG-05 | 버킷은 public read (사진 표시용), 업로드는 authenticated만 |

---

## 재방문 권장 규칙

| ID | 규칙 |
|----|------|
| BR-RC-01 | 회원별 가장 최근 시술 1건 기준 (member_last_visit 뷰) |
| BR-RC-02 | 권장 재방문일 = 마지막 visited_at + 시술.recommended_interval_days |
| BR-RC-03 | 시술 권장주기 미설정 시 권장 계산/표시 안 함 |
| BR-RC-04 | D-day < 0: 경과(빨강), 0~7: 임박(주황), >7: 표시 안 함/회색 |
| BR-RC-05 | 대시보드: 권장일이 경과했거나 이번 주(오늘~+7일) 내인 회원 표시 |

---

## 권한/데이터 접근 [SECURITY-08, 06]

| ID | 규칙 |
|----|------|
| BR-SEC-40 | `/admin/visits/**`는 미들웨어 인증 강제 |
| BR-SEC-41 | visit_history에 authenticated RLS 정책 |
| BR-SEC-42 | Storage 'visit-photos' 버킷: authenticated insert, public select |
| BR-SEC-43 | member_last_visit 뷰는 기반 테이블 RLS 상속 |

```sql
-- 마이그레이션 004
CREATE POLICY "authenticated admin full access on visit_history"
  ON visit_history FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated upload visit photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'visit-photos');

CREATE POLICY "public read visit photos"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'visit-photos');
```

---

## 입력 검증 [SECURITY-05]

| 스키마 | 파일 |
|--------|------|
| visitEditSchema | `lib/validations/visit.ts` |
| 이미지 파일 검증 | `lib/visit/upload.ts` (타입/크기) |
