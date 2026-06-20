# Code Summary — bolt-3.5-visit-history

> 검증: 단위 테스트 55/55 통과, 프로덕션 빌드 성공 (17 라우트).

## 생성/수정 파일

### DB (Step 1)
| 파일 | 상태 | 역할 |
|------|------|------|
| `supabase/migrations/004_visit_history_rls_view_storage.sql` | 생성 | RLS + member_last_visit 뷰 + Storage 버킷/정책 + appointment_id 유니크 |
| `types/database.ts` | 수정 | MemberLastVisit 뷰 타입 추가 |

### 유틸/검증 (Step 2)
| 파일 | 역할 |
|------|------|
| `lib/visit/recommend.ts` | 재방문 D-day/상태 계산 |
| `lib/visit/upload.ts` | 이미지 검증(타입/5MB) + Storage 업로드 |
| `lib/validations/visit.ts` | Zod visitEditSchema |

### 자동 생성 (Step 3)
| 파일 | 상태 | 변경 |
|------|------|------|
| `app/admin/(protected)/appointments/actions.ts` | 수정 | 완료 시 visit_history 자동 생성 (createVisitFromAppointment) |

### 시술 내역 편집 (Step 4)
| 파일 | 상태 |
|------|------|
| `app/admin/(protected)/visits/actions.ts` | 생성 (updateVisitAction) |
| `components/visits/PhotoUploader.tsx` | 생성 (Storage 업로드) |
| `components/visits/VisitEditForm.tsx` | 생성 |
| `app/admin/(protected)/visits/[id]/edit/page.tsx` | 생성 |

### 전체 목록 (Step 5)
| 파일 | 상태 | 변경 |
|------|------|------|
| `components/members/Pagination.tsx` | 수정 | basePath prop 일반화 |
| `app/admin/(protected)/visits/page.tsx` | 생성 | 전체 시술 내역 + 페이지네이션 |

### 재방문 권장 (Step 6)
| 파일 | 상태 | 변경 |
|------|------|------|
| `components/visits/ReturnBadge.tsx` | 생성 | D-day 배지 |
| `components/visits/VisitHistoryList.tsx` | 생성 | 회원별 히스토리 |
| `app/admin/(protected)/members/[id]/page.tsx` | 수정 | 재방문 섹션 + 히스토리 |
| `components/members/MemberCard.tsx` | 수정 | ReturnBadge |
| `app/admin/(protected)/members/page.tsx` | 수정 | member_last_visit 조인 |
| `app/admin/(protected)/dashboard/page.tsx` | 수정 | 재방문 권장 회원 목록 |

### 셸 (Step 7)
| 파일 | 변경 |
|------|------|
| `components/admin/AdminSidebar.tsx` | "시술 내역" 메뉴 추가 |

### 테스트 (Step 8)
| 파일 | 케이스 |
|------|--------|
| `tests/unit/recommend.test.ts` | 8 |
| `tests/unit/visit.validation.test.ts` | 5 |
| `tests/unit/upload.test.ts` | 4 |
| `tests/e2e/visits.spec.ts` | 2 시나리오 |

## 라우트 (신규 2개)

```
/admin/visits              전체 시술 내역 목록
/admin/visits/[id]/edit    시술 내역 편집 (결제금액/사진)
```

## 핵심 로직

| 기능 | 구현 |
|------|------|
| 완료 시 자동 생성 | updateAppointmentStatusAction → createVisitFromAppointment, appointment_id 유니크로 중복 방지 |
| 재방문 권장 | member_last_visit 뷰(DISTINCT ON) + getReturnInfo D-day 계산 |
| 3곳 표시 | 회원상세(섹션), 목록카드(배지), 대시보드(목록) |
| 사진 업로드 | 클라이언트 검증 → Supabase Storage → public URL → hidden input |

## 검증 결과

- ✅ 단위 테스트 55/55 통과 (Bolt1:9 + Bolt2:13 + Bolt3:18 + Bolt3.5:15)
- ✅ 프로덕션 빌드 성공 (17 라우트 + 미들웨어)
- ✅ TypeScript strict + ESLint 통과
- 빌드 중 수정: upload 테스트 File.size 모킹 오류

## 사용자 작업 (배포 시)

- Supabase SQL Editor에서 `004_*.sql` 실행
  - **Storage**: 마이그레이션이 'visit-photos' 버킷+정책 생성. 권한 문제 시 대시보드 Storage에서 수동 생성(public)
- next/image는 `unoptimized`로 외부 도메인 설정 불필요

## Security Compliance

SECURITY-05(Zod + 이미지 검증), 06(RLS + Storage 정책), 08(미들웨어 상속), 09(generic 에러), 15(try/catch) 적용.

## SPEC.md FR-04 완료

회원별 시술 히스토리 + 마지막 시술 기준 재방문 권장 — 완료.

## 다음

**Bolt 4 — Member PWA**: 카카오 로그인, 마이페이지(히스토리/포인트 조회).
