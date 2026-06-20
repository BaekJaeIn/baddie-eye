# Business Rules — bolt-4-member-pwa

## 회원 연결 규칙

| ID | 규칙 |
|----|------|
| BR-MB-01 | 카카오 로그인 성공 시 auth.users 세션 생성 |
| BR-MB-02 | 로그인 후 members.user_id = auth.uid() 행 있으면 마이페이지로 |
| BR-MB-03 | 연결 행 없으면 온보딩(전화번호 입력)으로 |
| BR-MB-04 | 입력 전화번호와 일치 + user_id IS NULL 회원 → 연결 (user_id 저장) [Q1] |
| BR-MB-05 | 일치 회원 없으면 신규 members 자동 생성 [Q2] (이름=카카오닉네임, tier=regular, points=0) |
| BR-MB-06 | 입력 번호가 이미 다른 user_id에 연결됨 → "이미 연결된 번호입니다" 차단 |
| BR-MB-07 | 전화번호 정규화 후 매칭 (normalizePhone 재사용) |

---

## 마이페이지 규칙

| ID | 규칙 |
|----|------|
| BR-ME-01 | 미인증 → /login 리다이렉트 |
| BR-ME-02 | 인증됐으나 미연결(members 없음) → /onboarding 리다이렉트 |
| BR-ME-03 | 시술 히스토리/포인트/등급은 읽기 전용 (고객 수정 불가) |
| BR-ME-04 | 자기 데이터만 조회 (RLS로 강제) |

---

## RLS 규칙 [SECURITY-06, 08]

| ID | 규칙 |
|----|------|
| BR-RLS-01 | members/visit_history: admin(role 클레임) 또는 owner(user_id) 접근 |
| BR-RLS-02 | Admin 계정은 app_metadata.role='admin' 보유 (설정 필요) |
| BR-RLS-03 | 고객은 자기 user_id 연결 데이터만 |
| BR-RLS-04 | 온보딩 시 members insert/update는 본인 user_id로만 (WITH CHECK) |
| BR-RLS-05 | treatment_types/appointments는 Bolt 4에서 고객 직접 접근 없음 (Bolt 5 조정) |

---

## 입력 검증 [SECURITY-05]

| ID | 필드 | 규칙 |
|----|------|------|
| BR-OB-01 | phone | 필수, 한국 전화번호 형식 (10~11자리), 정규화 |
| BR-OB-02 | 온보딩 폼 서버사이드 Zod 재검증 |

스키마: `lib/validations/onboarding.ts`

---

## 보안 노트 [수용된 리스크 — SECURITY-08]

| 항목 | 내용 |
|------|------|
| 리스크 | Q4=A 전화번호만 연결 → 타인 번호 입력 시 해당 회원 정보 조회 가능 (IDOR 유사) |
| 수용 근거 | 1인 소규모 샵, 신뢰 기반, 사용자 명시적 선택 |
| 최소 완화 | 이미 연결된 번호 재연결 차단 (BR-MB-06) |
| 향후 강화 | SMS 본인인증 또는 Admin 승인 연결 (별도 Bolt) |
| 문서화 | audit.md + 이 문서에 명시 (Security Compliance에 non-compliant-accepted로 기록) |

---

## PWA 규칙

| ID | 규칙 |
|----|------|
| BR-PWA-01 | manifest.json: name, short_name, icons(192/512), display=standalone, start_url=/me, theme_color |
| BR-PWA-02 | service worker 등록은 프로덕션에서만 (개발 중 캐싱 혼란 방지) |
| BR-PWA-03 | SW는 최소 동작 (install/activate, 네트워크 우선) — 오프라인 캐싱은 추후 |
| BR-PWA-04 | 아이콘은 placeholder 제공, 실제 로고로 교체 가능 |

---

## CSP 업데이트 [SECURITY-04]

카카오 OAuth 리다이렉트/이미지를 위해 next.config.mjs CSP에 카카오 도메인 추가 필요:
- `connect-src`: Supabase(기존) — 카카오 인증은 Supabase가 프록시하므로 추가 불필요할 수 있음
- `img-src`: 카카오 프로필 이미지 사용 시 `http://k.kakaocdn.net https://*.kakaocdn.net` 추가
- service worker는 same-origin이므로 CSP 영향 적음

> 실제 필요 도메인은 구현 시 확인하여 최소 범위로 추가.
