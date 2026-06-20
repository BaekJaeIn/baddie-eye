# Frontend Components — bolt-2-member-management

## 라우트 구조

```
app/admin/(protected)/members/
├── page.tsx                    # 회원 목록 (카드 그리드 + 검색/필터 + 페이지네이션)
├── new/
│   └── page.tsx                # 회원 등록 페이지
├── [id]/
│   ├── page.tsx                # 회원 상세
│   └── edit/
│       └── page.tsx            # 회원 수정 페이지
└── actions.ts                  # Server Actions (create/update/delete)
```

---

## MembersPage (`members/page.tsx`)

| 항목 | 내용 |
|------|------|
| 유형 | Server Component |
| Props | `searchParams: { q?, tier?, page? }` |
| 책임 | 검색/필터/페이지 기반 회원 조회 → 카드 그리드 렌더 |

**구성:**
```
<AdminHeader title="회원 관리" /> (레이아웃에서)
<MemberSearchBar />          // 검색어 + 등급 필터 (Client)
<MemberCardGrid members={} /> // 카드 그리드 (Server)
<Pagination current={} total={} /> // 페이지네이션 (Client)
[+ 회원 등록] 버튼 → /admin/members/new
```

---

## MemberSearchBar (`components/members/MemberSearchBar.tsx`)

| 항목 | 내용 |
|------|------|
| 유형 | Client Component |
| 책임 | 이름/전화번호 검색 입력 + 등급 필터 → URL searchParams 업데이트 |

```
<input name="q" placeholder="이름 또는 연락처 검색"
       data-testid="member-search-input" />
<select name="tier" data-testid="member-tier-filter">
  <option value="">전체 등급</option>
  <option value="regular">일반</option>
  <option value="loyal">단골</option>
  <option value="vip">VIP</option>
</select>
```
제출 시 `router.push('/admin/members?q=...&tier=...')`.

---

## MemberCard (`components/members/MemberCard.tsx`)

| 항목 | 내용 |
|------|------|
| 유형 | Server Component (정보 표시) + 삭제는 Client 액션 |
| Props | `member: Member` |

```
<div data-testid="member-card">
  <h3>{name}</h3>  <TierBadge tier={membership_tier} />
  <p>{포맷된 전화번호}</p>
  <p>첫 방문: {first_visit_at}</p>
  {allergy_note && <p className="text-red-600">⚠ {allergy_note}</p>}
  <Link href={`/admin/members/${id}`}>상세</Link>
</div>
```

---

## MemberForm (`components/members/MemberForm.tsx`)

| 항목 | 내용 |
|------|------|
| 유형 | Client Component (등록/수정 공용) |
| Props | `member?: Member` (수정 시 초기값), `action` |
| 책임 | 폼 필드 + 검증 + Server Action 제출 |

**필드** (BR-MEM-01~08):
| 필드 | 입력 | 필수 |
|------|------|------|
| 이름 | text | �필수 |
| 연락처 | tel | �필수 |
| 생일 | date | 선택 |
| 첫 방문일 | date | 선택 |
| 알러지/주의사항 | textarea | 선택 |
| 등급 | select | 기본 regular |
| 포인트 | number | 기본 0 |

`data-testid`: `member-form`, `member-form-name-input`, `member-form-phone-input`, `member-form-submit-button`, `member-form-error`.

---

## MemberDetailPage (`members/[id]/page.tsx`)

| 항목 | 내용 |
|------|------|
| 유형 | Server Component |
| 책임 | 회원 단건 조회 + 정보 표시 + 수정/삭제 버튼 |

```
회원 정보 카드
알러지/주의사항 강조 박스
[수정] → /admin/members/[id]/edit
[삭제] → DeleteMemberButton (확인 후 deleteMemberAction)
(시술 히스토리 영역 — Bolt 3에서 채움)
```

---

## DeleteMemberButton (`components/members/DeleteMemberButton.tsx`)

| 항목 | 내용 |
|------|------|
| 유형 | Client Component |
| 책임 | 삭제 확인 다이얼로그 → `deleteMemberAction(id)` |

```
confirm("정말 삭제하시겠습니까? (예약/시술 내역은 보존됩니다)")
→ deleteMemberAction(id) → 목록으로
data-testid="member-delete-button"
```

---

## Pagination (`components/members/Pagination.tsx`)

| 항목 | 내용 |
|------|------|
| 유형 | Client Component |
| Props | `currentPage`, `totalPages` |
| 책임 | 페이지 번호 클릭 → URL `?page=N` 업데이트 (검색/필터 유지) |

---

## Server Actions (`members/actions.ts`)

```typescript
'use server'

createMemberAction(prev, formData): Promise<{ error?: string }>
updateMemberAction(id, prev, formData): Promise<{ error?: string }>
deleteMemberAction(id): Promise<void>  // 소프트 삭제
```

각 액션: Zod 검증 → Supabase mutation → revalidatePath → (redirect).
전화번호 UNIQUE 위반은 캐치하여 generic 메시지 변환 [SECURITY-09].

---

## AdminSidebar 수정

Bolt 1 `components/admin/AdminSidebar.tsx`의 navItems에 추가:
```typescript
const navItems = [
  { label: '대시보드', href: '/admin/dashboard' },
  { label: '회원 관리', href: '/admin/members' },  // ← Bolt 2 추가
]
```
