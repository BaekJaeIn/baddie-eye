# 배포 가이드 — Baddie Eye

Supabase + Vercel 배포 전체 절차. 순서대로 진행하세요.

---

## 1. Supabase 설정

### 1.1 프로젝트
- https://supabase.com 에서 프로젝트 생성 (리전: Northeast Asia / Seoul 권장)

### 1.2 마이그레이션 (SQL Editor에서 순서대로 실행)
```
001_initial_schema.sql              # 4개 테이블 + 인덱스 + RLS
002_member_soft_delete_and_rls.sql  # 회원 소프트삭제 + RLS
003_treatment_interval_and_rls.sql  # 시술 권장주기 + RLS
004_visit_history_rls_view_storage.sql  # 시술내역 RLS + 뷰 + Storage
005_member_user_link_and_rls.sql    # 고객 연동 + RLS admin-or-owner
006_member_booking.sql              # 고객 예약(requested) + 함수
007_push_notifications.sql          # 웹푸시 구독 + reminder
```

### 1.3 Admin 계정 + role (필수)
1. Authentication > Users > Add user (이메일/비밀번호, Auto Confirm)
2. SQL Editor에서 role 부여:
```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
WHERE email = '원장님_이메일';
```
> ⚠️ role이 없으면 Admin이 데이터에 접근할 수 없습니다 (RLS).

### 1.4 카카오 로그인 (고객용)
- [kakao-setup-guide.md](aidlc-docs/construction/bolt-4-member-pwa/code/kakao-setup-guide.md) 참조

### 1.5 Storage
- 마이그레이션 004가 `visit-photos` 버킷/정책 생성 (안 되면 대시보드에서 수동 생성, public)

---

## 2. 환경변수 (전체)

Vercel 대시보드 > Settings > Environment Variables 에 등록:

| 변수 | 노출 | 출처 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 공개 | Supabase > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 공개 | Supabase > API (anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | **서버** | Supabase > API (service_role) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | 공개 | `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | **서버** | 위 명령 출력 |
| `VAPID_SUBJECT` | 서버 | `mailto:원장님_이메일` |
| `CRON_SECRET` | **서버** | 임의 랜덤 (`openssl rand -hex 32`) |
| `NEXT_PUBLIC_SENTRY_DSN` | 공개(선택) | Sentry |
| `SENTRY_AUTH_TOKEN` 등 | 서버(선택) | Sentry (소스맵) |

> **서버** 표시 변수는 절대 `NEXT_PUBLIC_` 접두사를 붙이지 마세요.

---

## 3. Vercel 배포

1. GitHub에 푸시 → Vercel에서 Import Project
2. Framework: Next.js (자동 감지)
3. 환경변수 등록 (위 표)
4. Deploy
5. Cron(`vercel.json`)은 배포 시 자동 등록
   - ⚠️ Hobby 플랜은 Cron 일 1회 제한 → 매시간 리마인더는 Pro 필요
   - [push-setup-guide.md](aidlc-docs/construction/bolt-6-notifications/code/push-setup-guide.md) 참조

---

## 4. 도메인 연결 (선택)
- Vercel > Settings > Domains 에서 커스텀 도메인 추가

---

## 5. 배포 후 점검
- [ ] `/admin/login` 로그인 → 대시보드
- [ ] 회원/시술/예약/시술내역 CRUD
- [ ] 통계 페이지 표시
- [ ] 고객 `/login` 카카오 로그인 → 마이페이지
- [ ] 고객 예약 신청 → Admin 승인
- [ ] PWA 홈화면 추가 (모바일)
- [ ] 푸시 구독 + 리마인더 (Pro 플랜)

상세: [deploy-checklist.md](aidlc-docs/construction/bolt-7-stats-deploy/code/deploy-checklist.md)
