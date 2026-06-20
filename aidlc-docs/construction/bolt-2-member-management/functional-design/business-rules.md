# Business Rules — bolt-2-member-management

## 입력 유효성 검사 규칙 [SECURITY-05]

| ID | 필드 | 규칙 | 에러 메시지 |
|----|------|------|-------------|
| BR-MEM-01 | name | 필수, 1~50자 | "이름을 입력해주세요 (최대 50자)" |
| BR-MEM-02 | phone | 필수, 한국 전화번호 형식 | "올바른 연락처를 입력해주세요" |
| BR-MEM-03 | phone | 유니크 (활성 회원 중복 불가) | "이미 등록된 연락처입니다" |
| BR-MEM-04 | birthday | 선택, 유효한 날짜, 미래 불가 | "생일이 올바르지 않습니다" |
| BR-MEM-05 | first_visit_at | 선택, 유효한 날짜 | "첫 방문일이 올바르지 않습니다" |
| BR-MEM-06 | allergy_note | 선택, 최대 500자 | "주의사항은 500자 이내로 입력해주세요" |
| BR-MEM-07 | membership_tier | regular/loyal/vip 중 하나, 기본 regular | — |
| BR-MEM-08 | points | 0 이상 정수, 기본 0 | "포인트는 0 이상이어야 합니다" |

전화번호 정규화: 입력 시 하이픈/공백 제거 후 저장, 표시 시 포맷팅(010-1234-5678).

---

## 비즈니스 규칙

| ID | 규칙 |
|----|------|
| BR-MEM-10 | 목록은 `is_active = true`인 회원만 표시 (소프트 삭제 제외) |
| BR-MEM-11 | 삭제는 물리 삭제가 아닌 `is_active = false` 설정 |
| BR-MEM-12 | 검색어(q)는 이름과 전화번호에 대해 부분 일치(ILIKE) |
| BR-MEM-13 | 등급 필터와 검색어는 AND 조건으로 결합 |
| BR-MEM-14 | 목록 정렬: 최근 등록순 (created_at DESC) |
| BR-MEM-15 | 페이지당 20명, 페이지 번호는 1부터 |
| BR-MEM-16 | 전화번호 중복 검사는 활성 회원(is_active=true) 대상 |

---

## 권한 규칙 [SECURITY-08]

| ID | 규칙 |
|----|------|
| BR-MEM-20 | 모든 `/admin/members/**` 경로는 Bolt 1 미들웨어로 인증 강제 (deny-by-default) |
| BR-MEM-21 | 회원 데이터는 service_role이 아닌 인증된 Admin 세션으로 접근 (RLS 정책 추가) |

---

## 데이터 접근 규칙 [SECURITY-06]

Bolt 1에서는 모든 테이블 RLS만 켜고 정책은 없었음(service_role 우회).
Bolt 2에서 인증된 Admin이 anon 키로 `members`에 접근하려면 RLS 정책 추가 필요:

```sql
-- 인증된 사용자(Admin)는 members 전체 접근
CREATE POLICY "authenticated admin full access on members"
  ON members FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);
```

> 주의: Bolt 1은 단일 Admin이므로 authenticated = Admin. Member(고객) 로그인이
> 추가되는 Bolt 4에서 이 정책을 더 세분화해야 함 (고객은 자기 데이터만).
