# Code Summary — bolt-4-member-pwa

> 검증: 단위 테스트 59/59 통과, 프로덕션 빌드 성공 (21 라우트).

## 생성/수정 파일

### DB (Step 1)
| 파일 | 상태 | 역할 |
|------|------|------|
| `supabase/migrations/005_member_user_link_and_rls.sql` | 생성 | members.user_id + RLS admin-or-owner 교체 + link_or_create_member 함수 |
| `types/database.ts` | 수정 | Member에 user_id 추가 |

### 검증/설정 (Step 2)
| 파일 | 상태 |
|------|------|
| `lib/validations/onboarding.ts` | 생성 (Zod 전화번호) |
| `next.config.mjs` | 수정 (CSP img-src 카카오 CDN) |

### 인증 (Step 3)
| 파일 | 상태 |
|------|------|
| `app/auth/callback/route.ts` | 생성 (OAuth code→세션) |
| `middleware.ts` | 수정 (/me, /onboarding 보호 + 영역 분리) |

### 고객 로그인 (Step 4)
| 파일 | 상태 |
|------|------|
| `app/(member)/layout.tsx` | 생성 (모바일 셸) |
| `app/(member)/login/page.tsx` | 생성 |
| `components/member/KakaoLoginButton.tsx` | 생성 |

### 온보딩 (Step 5)
| 파일 | 상태 |
|------|------|
| `app/(member)/onboarding/actions.ts` | 생성 (connectMemberAction → RPC) |
| `app/(member)/onboarding/page.tsx` | 생성 |
| `components/member/OnboardingForm.tsx` | 생성 |

### 마이페이지 (Step 6)
| 파일 | 상태 |
|------|------|
| `app/(member)/me/page.tsx` | 생성 (등급/포인트/히스토리/재방문) |
| `app/(member)/me/actions.ts` | 생성 (로그아웃) |
| `components/member/MemberHeader.tsx` | 생성 |
| `components/member/MyVisitHistory.tsx` | 생성 |

### PWA (Step 7)
| 파일 | 상태 |
|------|------|
| `public/manifest.json` | 생성 |
| `public/sw.js` | 생성 (최소 SW) |
| `public/icon-192.png`, `public/icon-512.png` | 생성 (placeholder, 브랜드색) |
| `components/pwa/ServiceWorkerRegister.tsx` | 생성 |
| `app/layout.tsx` | 수정 (manifest/메타/viewport/SW 등록) |

### 테스트 (Step 8)
| 파일 | 케이스 |
|------|--------|
| `tests/unit/onboarding.validation.test.ts` | 4 |
| `tests/e2e/member.spec.ts` | 4 시나리오 |

## 라우트 (신규 4개)

```
/login           카카오 로그인 (공개)
/auth/callback   OAuth 콜백 핸들러
/onboarding      전화번호 입력 → 회원 연결/생성
/me              마이페이지 (등급/포인트/히스토리)
```

## 핵심 로직

| 기능 | 구현 |
|------|------|
| 카카오 로그인 | signInWithOAuth({provider:'kakao'}) → /auth/callback → exchangeCodeForSession |
| 회원 연결 [Q1/Q2] | SECURITY DEFINER 함수 link_or_create_member (RLS 우회하며 auth.uid()로 호출자 검증) |
| RLS 재설계 | members/visit_history → admin-or-owner, treatment_types/appointments → admin-only |
| 마이페이지 | 자기 user_id members + visit_history (RLS로 격리) |
| PWA | manifest + 최소 SW(프로덕션만 등록) + maskable 아이콘 |

## 보안

| 규칙 | 적용 |
|------|------|
| SECURITY-05 | onboarding Zod 검증 |
| SECURITY-06 | RLS admin-or-owner, RPC EXECUTE는 authenticated만 |
| SECURITY-08 | 미들웨어 고객 영역 보호, RLS 데이터 격리 |
| SECURITY-09 | generic 에러 |
| **수용된 리스크** | Q4=A 전화번호만 연결 → IDOR 유사 (소규모 신뢰 기반, BR-MB-06 재연결 차단으로 최소 완화, 향후 SMS 인증) |

## 검증 결과

- ✅ 단위 테스트 59/59 통과 (Bolt1~3.5: 55 + Bolt4: 4)
- ✅ 프로덕션 빌드 성공 (21 라우트 + 미들웨어)
- ✅ TypeScript strict + ESLint 통과
- ✅ PWA 아이콘 192/512 PNG 생성 확인

## 사용자 작업 (배포 시)

[kakao-setup-guide.md](kakao-setup-guide.md) 참고:
1. 마이그레이션 005 실행
2. **Admin 계정에 role 부여** (RLS 정책상 필수)
3. 카카오 개발자 콘솔 앱 + Supabase Kakao provider 설정
4. PWA 아이콘 실제 로고로 교체 (선택)

## 다음

**Bolt 5 — Member 예약 기능**: 예약 가능 시간 조회, 예약 신청/취소.
