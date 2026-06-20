# Supabase 셋업 가이드 — Bolt 1

코드 생성 후 앱을 실제로 실행하려면 아래 단계를 따라주세요.

---

## 1. 의존성 설치

```bash
pnpm install
```

> pnpm이 없다면: `npm install -g pnpm`

---

## 2. Supabase 프로젝트 생성

1. https://supabase.com 가입/로그인
2. **New Project** 클릭
3. 프로젝트 이름(예: `baddie-eye`), DB 비밀번호 설정, 리전은 **Northeast Asia (Seoul)** 권장
4. 생성 완료까지 약 2분 대기

---

## 3. 환경변수 설정

1. Supabase 대시보드 → **Project Settings** → **API**
2. 아래 값 복사:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. 프로젝트 루트에 `.env.local` 생성:

```bash
cp .env.local.example .env.local
```

4. `.env.local`에 복사한 값 입력:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

> Sentry는 선택사항. DSN을 비워두면 에러 추적만 비활성화되고 앱은 정상 동작합니다.

---

## 4. DB 스키마 마이그레이션

1. Supabase 대시보드 → **SQL Editor** → **New query**
2. `supabase/migrations/001_initial_schema.sql` 내용 전체 복사 → 붙여넣기
3. **Run** 클릭
4. **Table Editor**에서 `members`, `treatment_types`, `appointments`, `visit_history` 4개 테이블 생성 확인

---

## 5. Admin 계정 생성

1. Supabase 대시보드 → **Authentication** → **Users** → **Add user** → **Create new user**
2. 원장님 이메일 + 비밀번호(8자 이상) 입력
3. **Auto Confirm User** 체크 (이메일 인증 생략)
4. **Create user** 클릭

> 앱에는 회원가입 UI가 없습니다. Admin 계정은 항상 여기서 수동 생성합니다.

---

## 6. 개발 서버 실행

```bash
pnpm dev
```

1. http://localhost:3000 접속 → 자동으로 `/admin/login` 이동
2. 5단계에서 만든 계정으로 로그인
3. 대시보드 진입 확인
4. 로그아웃 → 로그인 페이지 복귀 확인

---

## 7. 테스트 실행 (선택)

```bash
# 단위 테스트 (Supabase 불필요)
pnpm test

# E2E 테스트 (개발 서버 자동 실행)
#  로그인 성공 시나리오까지 테스트하려면 환경변수 추가:
#  E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD
pnpm test:e2e
```

---

## 문제 해결

| 증상 | 원인 / 해결 |
|------|-------------|
| 로그인 후 다시 로그인 페이지로 튕김 | 환경변수 URL/키 오타 확인 |
| "Invalid API key" | anon key를 다시 복사 (service_role 키 아님 주의) |
| 로그인 무한 로딩 | Supabase 프로젝트가 일시정지(Free 7일) 상태인지 확인 |
| 테이블 없음 에러 | 4단계 마이그레이션 재실행 |

---

## ⚠️ 운영 전 체크리스트

- [ ] Supabase **Free → Pro** 업그레이드 (Free는 7일 비활성 시 일시정지)
- [ ] Vercel 배포 시 환경변수를 Vercel 대시보드에 등록
- [ ] Sentry DSN 설정으로 에러 추적 활성화
- [ ] `SENTRY_AUTH_TOKEN`은 Vercel 환경변수로만 (클라이언트 노출 금지)
