# Business Logic Model — bolt-4-member-pwa

## 설계 결정 (사용자 답변)

| 질문 | 결정 |
|------|------|
| Q1 회원 연결 | 첫 로그인 시 전화번호 입력 → members.phone 매칭 → user_id 저장 |
| Q2 매칭 실패 | 카카오 정보 + 입력 전화번호로 신규 members 자동 생성 |
| Q3 PWA | manifest + 아이콘 + 기본 service worker |
| Q4 본인 확인 | 전화번호 입력만 (소규모 신뢰 기반) |
| Q5 범위 | 전체 구현 (카카오 + 연결 + 마이페이지 + PWA) |

---

## 1. 고객 인증 + 온보딩 플로우

```
[고객] 카카오 로그인 버튼 (/login 또는 랜딩)
    |
    | Supabase Auth — signInWithOAuth({ provider: 'kakao' })
    v
[카카오 인증] → 콜백 (/auth/callback)
    | Supabase 세션 생성 (auth.users)
    v
[연결 확인]
    | members에서 user_id = auth.uid() 인 행 조회
    |
    |-- 있음 → /me (마이페이지)
    |-- 없음 → /onboarding (전화번호 입력)
    v
[/onboarding] 전화번호 입력
    | connectMemberAction(phone, kakaoName)
    |
    | 1. members에서 phone 일치 + user_id IS NULL 조회 [Q1]
    |    있으면 → user_id = auth.uid() 업데이트 (연결)
    | 2. 없으면 → 신규 members 생성 [Q2]
    |    { name: 카카오닉네임, phone, user_id, membership_tier: 'regular' }
    | 3. phone이 이미 다른 user_id에 연결됨 → "이미 연결된 번호입니다"
    v
[/me 마이페이지로 이동]
```

**Admin 인증과 분리**:
- Admin: `/admin/login` 이메일/비밀번호 (Bolt 1)
- 고객: `/login` 카카오 (Bolt 4)
- 미들웨어가 두 영역을 각각 보호

---

## 2. 마이페이지 (FR-09)

```
[/me] 마이페이지 (인증 + 연결 필요)
    | 내 members 정보 (user_id = auth.uid())
    | + 내 visit_history (member_id 기준)
    v
[표시]
    | - 이름, 등급(TierBadge), 포인트
    | - 시술 히스토리 (날짜/시술명/사진) — 읽기 전용
    | - 다음 예약 권장 시점 (member_last_visit, 있으면)
    | - 로그아웃
    | (예약 신청은 Bolt 5)
```

---

## 3. RLS 재설계 (핵심)

기존 "authenticated 전체 접근"은 고객이 추가되면 위험.
**admin-or-owner** 정책으로 교체:

```sql
-- Admin 식별: app_metadata.role = 'admin' (Admin 계정에 설정)
-- 고객: 자기 user_id에 연결된 데이터만

-- members
CREATE POLICY members_access ON members FOR ALL TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  OR user_id = auth.uid()
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  OR user_id = auth.uid()
);

-- visit_history (고객은 자기 회원의 내역만 읽기)
CREATE POLICY visit_history_access ON visit_history FOR ALL TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  OR member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
);

-- treatment_types, appointments: Admin만 (고객 직접 접근 불필요, Bolt 5에서 조정)
```

**Admin 계정 설정 필요** (setup-guide):
```sql
-- Admin 계정에 role 부여
UPDATE auth.users SET raw_app_meta_data =
  raw_app_meta_data || '{"role":"admin"}'
WHERE email = 'admin@example.com';
```

> 기존 Admin 페이지(anon key + authenticated 세션)는 role=admin 클레임으로 계속 전체 접근.
> 코드 변경 없이 RLS 정책 + Admin 계정 메타데이터만 조정.

---

## 4. 보안 노트 [수용된 리스크]

**Q4=A (전화번호만 연결)**: 타인의 전화번호를 입력하면 그 회원과 연결되어
시술 이력을 볼 수 있는 IDOR 유사 위험 [SECURITY-08].
- **수용 근거**: 1인 소규모 샵, 신뢰 기반, 사용자 명시적 선택.
- **완화 방향(향후)**: SMS 본인인증, 또는 Admin 승인 후 연결.
- 이미 다른 user_id에 연결된 번호는 재연결 차단 (탈취 방지 최소 장치).

---

## 5. PWA (Q3=A, FR-12)

| 요소 | 구현 |
|------|------|
| manifest.json | 앱 이름, 아이콘, theme_color, display: standalone, start_url: /me |
| 아이콘 | 192x192, 512x512 (placeholder 제공, 사용자 교체 가능) |
| service worker | 최소 SW (설치/활성화, 네트워크 우선) — 홈화면 추가 + 설치 가능 |
| 메타 | app/layout.tsx에 manifest 링크, apple-touch-icon, theme-color |
| 등록 | 클라이언트에서 navigator.serviceWorker.register('/sw.js') |

> 오프라인 풀 캐싱은 Bolt 6(웹푸시)와 함께 확장.

---

## 6. 스키마 변경 (마이그레이션 005)

```sql
-- 회원 ↔ auth 연결
ALTER TABLE members ADD COLUMN user_id UUID UNIQUE REFERENCES auth.users(id);
CREATE INDEX idx_members_user_id ON members (user_id);

-- RLS 정책 교체 (admin-or-owner) — 위 3절
-- members, visit_history 정책 DROP & CREATE
```
