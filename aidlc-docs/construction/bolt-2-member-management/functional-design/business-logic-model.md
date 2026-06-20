# Business Logic Model — bolt-2-member-management

## 설계 결정 (사용자 답변)

| 질문 | 결정 |
|------|------|
| 목록 표시 | 카드 형태 (그리드) |
| 검색/필터 | 이름 검색 + 전화번호 검색 + 등급 필터 |
| 삭제 방식 | 소프트 삭제 (`is_active` 플래그) |
| 등록/수정 | 별도 페이지 |
| 페이지네이션 | 페이지당 20명 |

---

## 1. 회원 목록 조회 플로우

```
[/admin/members] Server Component
    |
    | URL searchParams: ?q=검색어&tier=등급&page=N
    v
[회원 목록 조회]
    | Supabase 쿼리:
    |   - is_active = true (소프트 삭제 제외)
    |   - 이름 ILIKE %q% OR 전화번호 ILIKE %q%  (q 있을 때)
    |   - membership_tier = tier  (tier 필터 있을 때)
    |   - ORDER BY created_at DESC
    |   - range(page*20, page*20+19)  [페이지네이션]
    v
[카드 그리드 렌더링] + [페이지네이션 컨트롤]
```

**검색/필터는 URL searchParams 기반** (서버 컴포넌트 친화적, 북마크/공유 가능).

---

## 2. 회원 등록 플로우

```
[/admin/members/new] 등록 페이지
    |
    | MemberForm 제출
    v
[createMemberAction] Server Action
    | 1. Zod 검증 (memberSchema) [SECURITY-05]
    | 2. Supabase insert
    |    - 전화번호 중복 → UNIQUE 위반 캐치 → "이미 등록된 연락처입니다"
    | 3. 성공 → revalidatePath('/admin/members') + redirect
    v
[목록으로 이동]
```

---

## 3. 회원 수정 플로우

```
[/admin/members/[id]/edit] 수정 페이지
    |
    | 기존 회원 데이터 로드 (Server Component)
    | MemberForm (초기값 채움) 제출
    v
[updateMemberAction] Server Action
    | 1. Zod 검증
    | 2. Supabase update (id 기준)
    |    - 전화번호 변경 시 중복 체크
    | 3. revalidatePath + redirect
    v
[상세/목록으로 이동]
```

---

## 4. 회원 삭제 플로우 (소프트 삭제)

```
[회원 카드/상세] 삭제 버튼
    |
    | deleteMemberAction(id) Server Action
    v
[소프트 삭제]
    | Supabase update: is_active = false
    | (물리 삭제 아님 → 예약/시술 내역 FK 보존)
    | revalidatePath('/admin/members')
    v
[목록에서 사라짐 (is_active=true 필터로 제외)]
```

**소프트 삭제 선택 이유**: 예약/시술 내역(`appointments`, `visit_history`)이
`ON DELETE RESTRICT`로 묶여 물리 삭제가 불가능. 데이터 보존 + 통계 정확성 확보.

---

## 5. 회원 상세 조회 플로우

```
[/admin/members/[id]] 상세 페이지
    |
    | 회원 단건 조회 (Server Component)
    v
[회원 정보 표시]
    | - 기본 정보 (이름, 연락처, 생일, 첫방문일)
    | - 알러지/주의사항 (강조 표시)
    | - 등급, 포인트
    | - [수정] [삭제] 버튼
    | (시술 히스토리는 Bolt 3에서 연결)
```

---

## 6. 스키마 변경 (마이그레이션 002)

```sql
-- 소프트 삭제 지원
ALTER TABLE members ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- 활성 회원 목록 조회 성능
CREATE INDEX idx_members_is_active ON members (is_active);

-- 이름 검색 성능 (선택적, 한글 ILIKE)
CREATE INDEX idx_members_name ON members (name);
```
