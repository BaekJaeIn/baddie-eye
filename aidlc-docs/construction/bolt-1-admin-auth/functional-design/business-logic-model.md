# Business Logic Model — bolt-1-admin-auth

---

## 1. 로그인 플로우

```
[브라우저] 이메일 + 비밀번호 입력
    |
    | form submit
    v
[LoginForm] 클라이언트사이드 유효성 검사
    |-- 실패 → 에러 메시지 표시 (진행 중단)
    |-- 통과 →
    v
[loginAction] Server Action
    |
    | AuthService.signIn(email, password)
    v
[AuthService]
    |
    | supabase.auth.signInWithPassword({ email, password })
    v
[Supabase Auth]
    |-- 실패 → { error: "이메일 또는 비밀번호가 올바르지 않습니다" } 반환
    |          (구체적 실패 이유 미노출 - SECURITY-09)
    |-- 성공 → 세션 쿠키 설정 (Secure/HttpOnly/SameSite=Lax)
    v
[loginAction]
    |-- 에러 → LoginForm에 에러 메시지 반환
    |-- 성공 → redirect('/admin/dashboard')
```

---

## 2. 세션 검증 플로우 (매 요청)

```
[브라우저] /admin/* 요청
    |
    v
[middleware.ts] 모든 /admin/* 요청 인터셉트
    |
    | createMiddlewareClient(request)
    | supabase.auth.getUser()   ← 세션 쿠키 자동 갱신 포함
    |
    |-- 경로가 /admin/login 이고 세션 있음
    |       → redirect('/admin/dashboard')  (중복 로그인 방지)
    |
    |-- 경로가 /admin/login 이고 세션 없음
    |       → 통과 (로그인 페이지 표시)
    |
    |-- 경로가 /admin/login 외 이고 세션 없음
    |       → redirect('/admin/login')  (deny-by-default - SECURITY-08)
    |
    |-- 경로가 /admin/login 외 이고 세션 있음
    |       → 통과 (요청된 페이지 표시)
    v
[Next.js Page] 렌더링
```

---

## 3. 로그아웃 플로우

```
[AdminHeader] 로그아웃 버튼 클릭
    |
    | logoutAction() Server Action 호출
    v
[logoutAction]
    |
    | AuthService.signOut()
    v
[AuthService]
    |
    | supabase.auth.signOut()
    v
[Supabase Auth]
    |-- 세션 토큰 무효화
    |-- 세션 쿠키 삭제
    v
[logoutAction]
    |
    | redirect('/admin/login')
```

---

## 4. 세션 관리 정책

| 항목 | 값 | 근거 |
|------|-----|------|
| 세션 만료 | 1일 | 사용자 결정 (Q1=B) |
| 쿠키 속성 | Secure + HttpOnly + SameSite=Lax | SECURITY-12 |
| 세션 갱신 | 자동 (Supabase SSR 미들웨어) | 페이지 이동 시 쿠키 자동 갱신 |
| 만료 시 처리 | `/admin/login` 리다이렉트 | deny-by-default |

---

## 5. 에러 처리 정책 [SECURITY-15]

| 시나리오 | 처리 방식 |
|----------|-----------|
| 잘못된 자격증명 | Generic 메시지 반환, 원인 미노출 |
| 네트워크 오류 | "일시적 오류가 발생했습니다. 다시 시도해주세요." |
| Supabase 서비스 오류 | 동일 Generic 메시지, 서버 로그에 상세 기록 |
| 세션 만료 | 미들웨어가 자동으로 로그인 페이지 리다이렉트 |
| 미처리 예외 | 전역 에러 핸들러가 캐치, 안전한 응답 반환 |
