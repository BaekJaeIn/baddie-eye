# Frontend Components — bolt-3.5-visit-history

## 라우트 구조

```
app/admin/(protected)/
├── visits/
│   ├── page.tsx              # 전체 시술 내역 목록 (Q4=B)
│   ├── [id]/edit/page.tsx    # 시술 내역 편집 (Q1=B)
│   └── actions.ts            # updateVisitAction
└── (수정) members/[id]/page.tsx     # 시술 히스토리 + 재방문 권장 추가
   (수정) members/page.tsx           # 재방문 배지 추가
   (수정) dashboard/page.tsx         # 재방문 권장 회원 목록 추가
   (수정) appointments/actions.ts    # 완료 시 visit_history 자동 생성
```

---

## 신규 컴포넌트

### VisitHistoryList (`components/visits/VisitHistoryList.tsx`)
- Server Component. 회원 상세에서 사용.
- Props: `visits: VisitWithTreatment[]`
- 시술 내역을 최신순 리스트로 (날짜, 시술명, 결제금액, 사진 썸네일, [편집])

### ReturnBadge (`components/visits/ReturnBadge.tsx`)
- 재방문 권장 배지. Props: `recommendedReturnDate: string | null`
- D-day 계산 → 경과(빨강)/임박(주황)/여유(미표시)
- `data-testid="return-badge"`

### VisitEditForm (`components/visits/VisitEditForm.tsx`)
- Client Component. 결제금액 + 사진 업로드.
- Props: `visit`, `action`
- 필드: price_paid(number), visited_at(datetime-local), before/after 사진 업로더
- `data-testid`: `visit-edit-form`, `visit-price-input`, `visit-photo-input`, `visit-edit-submit`

### PhotoUploader (`components/visits/PhotoUploader.tsx`)
- Client Component. Supabase Storage 업로드 (Q3=B).
- 파일 선택 → 클라이언트 검증(타입/크기 BR-IMG) → Storage 업로드 → URL 반환
- 미리보기 + 업로드 진행 표시
- `data-testid="photo-uploader"`

---

## 화면별 상세

### VisitsPage (`visits/page.tsx`) — 전체 시술 내역
| 항목 | 내용 |
|------|------|
| 유형 | Server Component |
| Props | `searchParams: { page? }` |
| 조회 | visit_history + members(name) + treatment_types(name), visited_at DESC, 20건 페이지네이션 |

테이블: 날짜 / 회원 / 시술 / 결제금액 / [편집]
재사용: Bolt 2 `Pagination` (경로만 /admin/visits로)

> Pagination 컴포넌트가 /admin/members 경로 하드코딩이면 `basePath` prop으로 일반화 필요.

### VisitEditPage (`visits/[id]/edit/page.tsx`)
- visit_history 단건 조회 (회원명, 시술명 포함)
- VisitEditForm 렌더

### 회원 상세 수정 (`members/[id]/page.tsx`)
- 기존 정보 카드 아래에 추가:
  - **재방문 권장 섹션**: member_last_visit 조회 → ReturnBadge + 마지막 시술 정보
  - **시술 히스토리 섹션**: VisitHistoryList (해당 회원 visit_history)
- "시술 히스토리는 Bolt 3.5에서..." 안내 문구 제거

### 회원 목록 수정 (`members/page.tsx` + `MemberCard.tsx`)
- members 조회 시 member_last_visit 조인 (또는 별도 조회 후 매핑)
- MemberCard에 ReturnBadge 추가 (recommendedReturnDate prop)

### 대시보드 수정 (`dashboard/page.tsx`)
- member_last_visit에서 recommended_return_date가 경과 또는 이번 주(오늘~+7일)인 회원 조회
- "재방문 권장 회원" 리스트 (회원명 + D-day + 상세 링크)
- 기존 "안녕하세요 원장님" 유지

---

## 유틸

### `lib/visit/recommend.ts`
```typescript
export type ReturnStatus = 'overdue' | 'soon' | 'later' | 'none'
export function getReturnStatus(recommendedReturnDate: string | null): {
  status: ReturnStatus
  dday: number | null
}
```

### `lib/visit/upload.ts`
```typescript
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export function validateImageFile(file: File): string | null  // 에러 메시지 or null
export async function uploadVisitPhoto(
  file: File, memberId: string, visitId: string
): Promise<string>  // 공개 URL
```

### `lib/validations/visit.ts`
```typescript
export const visitEditSchema = z.object({
  price_paid: z.coerce.number().int().min(0),
  visited_at: z.string(),  // datetime-local
  before_after_photo_url: z.string().url().nullable().or(z.literal('')),
})
```

---

## 액션 수정

### appointments/actions.ts — updateAppointmentStatusAction
완료 처리 시 visit_history 자동 생성 로직 추가 (BR-VH-01~06).

### visits/actions.ts — updateVisitAction (신규)
결제금액/사진/방문일 업데이트.

---

## 사이드바 수정
`AdminSidebar.tsx`에 "시술 내역" 추가:
```typescript
{ label: '시술 내역', href: '/admin/visits' },
```
순서: 대시보드 → 회원 → 예약 → 시술 종류 → 시술 내역
