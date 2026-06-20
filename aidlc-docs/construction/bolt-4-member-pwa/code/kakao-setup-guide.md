# 카카오 로그인 + Member PWA 설정 가이드 (Bolt 4)

Bolt 4 코드는 완성됐지만, 실제 카카오 로그인이 동작하려면 아래 외부 설정이 필요합니다.

---

## 1. 마이그레이션 005 실행

Supabase SQL Editor에서 `supabase/migrations/005_member_user_link_and_rls.sql` 실행.

이 마이그레이션은:
- `members.user_id` 컬럼 추가
- RLS를 admin-or-owner로 교체
- `link_or_create_member` 함수 생성

---

## 2. ⚠️ Admin 계정에 role 부여 (필수)

RLS가 admin-or-owner로 바뀌었으므로, **Admin 계정에 role을 부여하지 않으면 Admin이
회원/시술 데이터에 접근할 수 없습니다**. SQL Editor에서:

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
WHERE email = '원장님_이메일@example.com';
```

> 설정 후 Admin은 재로그인해야 새 JWT에 role이 반영됩니다.

---

## 3. 카카오 개발자 콘솔 설정

1. https://developers.kakao.com 로그인 → **내 애플리케이션** → **애플리케이션 추가**
2. 앱 이름(예: Baddie Eye), 사업자명 입력
3. **앱 키** → **REST API 키** 복사 (Supabase에서 사용)
4. **카카오 로그인** 메뉴 → **활성화 ON**
5. **Redirect URI** 등록:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   (Supabase 대시보드 > Authentication > Providers > Kakao 에서 정확한 URI 확인)
6. **동의 항목**: 닉네임(profile_nickname) 정도면 충분 (전화번호는 비즈앱 검수 필요 — 우리는 앱에서 직접 입력받으므로 불필요)

---

## 4. Supabase Auth — Kakao Provider 설정

1. Supabase 대시보드 → **Authentication** → **Providers** → **Kakao**
2. **Enable** 켜기
3. **REST API Key**(카카오 REST API 키)와 필요 시 **Client Secret** 입력
   - 카카오 > 앱 설정 > 보안 > Client Secret (사용 시)
4. 저장

---

## 5. 로컬/배포 환경변수

추가 환경변수는 없습니다. 카카오 키는 Supabase 대시보드에서 관리되고,
앱은 `signInWithOAuth({ provider: 'kakao' })`만 호출합니다.

배포(Vercel) 시 Redirect 흐름:
- 카카오 → Supabase callback → 앱 `/auth/callback` → `/me`
- 앱 도메인이 바뀌면 카카오 Redirect URI는 Supabase 도메인이므로 변경 불필요

---

## 6. 동작 확인

1. 마이그레이션 005 실행 + Admin role 부여
2. `pnpm dev` → http://localhost:3000/login
3. 카카오 로그인 → 첫 로그인이면 `/onboarding`으로
4. 샵에 등록된 전화번호 입력 → 연결 → `/me`
   - 미등록 번호면 신규 회원 자동 생성 후 `/me`
5. 마이페이지에서 등급/포인트/시술 내역 확인

---

## 7. PWA 설치 확인

1. 배포 후(HTTPS 필수) 모바일 브라우저로 `/me` 접속
2. 브라우저 메뉴 → "홈 화면에 추가"
3. 홈 아이콘으로 실행 → standalone 모드

> 아이콘은 placeholder(브랜드색 단색)입니다. `public/icon-192.png`, `public/icon-512.png`를
> 실제 로고로 교체하세요.

---

## 보안 참고 (수용된 리스크)

전화번호만으로 회원을 연결하므로(Q4=A), 타인의 전화번호를 알면 그 회원의 시술 내역을
조회할 수 있습니다. 소규모 신뢰 기반으로 수용한 결정이며, 보안을 강화하려면:
- 향후 SMS 본인인증 추가
- 또는 Admin이 연결을 승인하는 방식으로 전환
