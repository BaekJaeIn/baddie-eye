# Code Summary — bolt-2-member-management

> 검증: 단위 테스트 22/22 통과, 프로덕션 빌드 성공.

## 생성/수정 파일

### DB (Step 1)
| 파일 | 상태 | 역할 |
|------|------|------|
| `supabase/migrations/002_member_soft_delete_and_rls.sql` | 생성 | is_active 컬럼 + 인덱스 + RLS 정책 |
| `types/database.ts` | 수정 | Member에 `is_active` 추가 |

### 검증/유틸 (Step 2)
| 파일 | 상태 | 역할 |
|------|------|------|
| `lib/format.ts` | 생성 | 전화번호 정규화/포맷, 등급 라벨 |
| `lib/validations/member.ts` | 생성 | Zod memberSchema [SECURITY-05] |

### Server Actions (Step 3)
| 파일 | 상태 | 역할 |
|------|------|------|
| `app/admin/(protected)/members/actions.ts` | 생성 | create/update/소프트delete, 중복 전화번호 처리 [SECURITY-09] |

### 회원 목록 (Step 4)
| 파일 | 상태 |
|------|------|
| `app/admin/(protected)/members/page.tsx` | 생성 (검색/필터/페이지네이션) |
| `components/members/MemberCard.tsx` | 생성 |
| `components/members/MemberSearchBar.tsx` | 생성 |
| `components/members/TierBadge.tsx` | 생성 |
| `components/members/Pagination.tsx` | 생성 |

### 등록/수정 (Step 5)
| 파일 | 상태 |
|------|------|
| `components/members/MemberForm.tsx` | 생성 (등록/수정 공용) |
| `app/admin/(protected)/members/new/page.tsx` | 생성 |
| `app/admin/(protected)/members/[id]/edit/page.tsx` | 생성 |

### 상세/삭제 (Step 6)
| 파일 | 상태 |
|------|------|
| `app/admin/(protected)/members/[id]/page.tsx` | 생성 |
| `components/members/DeleteMemberButton.tsx` | 생성 (소프트 삭제 확인) |

### 셸 정리 (Step 7)
| 파일 | 상태 | 변경 |
|------|------|------|
| `components/admin/AdminSidebar.tsx` | 수정 | "회원 관리" 메뉴 추가 + 하위경로 active 판정 |
| `components/admin/AdminHeader.tsx` | 수정 | title prop 제거 (로그아웃만 담당) |
| `components/admin/AdminLayout.tsx` | 수정 | title prop 제거 |

### 테스트 (Step 8)
| 파일 | 상태 | 케이스 |
|------|------|--------|
| `tests/unit/format.test.ts` | 생성 | 6 |
| `tests/unit/member.validation.test.ts` | 생성 | 7 |
| `tests/e2e/member-management.spec.ts` | 생성 | 3 시나리오 |

## 라우트

```
/admin/members              목록 (검색/필터/페이지네이션)
/admin/members/new          등록
/admin/members/[id]         상세
/admin/members/[id]/edit    수정
```

## 설계 대비 변경

| 변경 | 이유 |
|------|------|
| AdminHeader/Layout title prop 제거 | App Router 레이아웃은 자식 페이지 제목을 모름 → 각 페이지가 본문 제목 담당 |
| 사이드바 active 판정에 startsWith 추가 | `/admin/members/123`에서도 "회원 관리" 활성화 |

## 검증 결과

- ✅ 단위 테스트 22/22 통과 (Bolt 1: 9 + Bolt 2: 13)
- ✅ 프로덕션 빌드 성공 (8개 라우트 + 미들웨어)
- ✅ TypeScript strict + ESLint 통과

## 사용자 작업 (배포 시)

- Supabase SQL Editor에서 `002_member_soft_delete_and_rls.sql` 실행
  - **중요**: 이 마이그레이션의 RLS 정책이 없으면 anon 키로 회원 데이터 접근 불가

## Security Compliance

SECURITY-05(Zod 검증), 08(미들웨어 보호 상속), 09(중복 전화번호 generic 에러), 15(try/catch) 적용.
SECURITY-06: members RLS 정책 추가 (authenticated 접근).
