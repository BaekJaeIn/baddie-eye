# Application Design Plan — Bolt 1

## 실행 체크리스트

- [x] 사용자 설계 질문 수집
- [x] components.md 생성
- [x] component-methods.md 생성
- [x] services.md 생성
- [x] component-dependency.md 생성
- [x] application-design.md 생성 (통합 문서)

---

## 설계 컨텍스트 (사전 결정 사항)

SPEC.md + 요구사항 분석 결과, 아래 사항은 이미 확정되었습니다:

| 항목                | 결정                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------- |
| 라우팅 전략         | Next.js App Router — `(admin)` route group으로 관리자, `(member)` route group으로 고객 분리 |
| Supabase 클라이언트 | `@supabase/ssr` 패키지 — 서버 컴포넌트용 server client, 브라우저용 browser client 분리      |
| 인증 미들웨어       | `middleware.ts` 파일 — `/admin/**` 경로 보호, 미인증 시 `/admin/login`으로 리다이렉트       |
| 환경변수 관리       | `.env.local` (개발), Vercel 환경변수 (배포) — 하드코딩 금지                                 |
| TypeScript          | strict mode 활성화                                                                          |
| 스타일링            | Tailwind CSS v3, 별도 컴포넌트 라이브러리는 Bolt 1에서 결정 필요                            |

---

## 설계 질문

아래 질문들은 Admin 셸 구조에 영향을 미치며 Bolt 2~7 전반에 걸쳐 유지됩니다.
각 질문의 `[Answer]:` 뒤에 알파벳을 입력해주세요. 완료 후 "완료"라고 알려주세요.

---

### Question 1

Admin 대시보드 레이아웃 스타일을 선택해주세요.
이 결정은 Bolt 1에서 만드는 셸 레이아웃의 기본 구조가 되며 Bolt 7까지 유지됩니다.

A) 좌측 고정 사이드바 + 상단 헤더
(SaaS 관리 대시보드 표준 스타일, 원장 노트북 사용에 최적, 메뉴 확장성 좋음)

B) 상단 수평 네비게이션 바
(심플, 메뉴 수가 적을 때 깔끔함)

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: A

---

### Question 2

Admin 사이드바/메뉴에 Bolt 1~7 전체 항목을 미리 추가할까요, 아니면 구현된 것만 표시할까요?

A) 전체 메뉴 미리 추가 (미구현 항목은 비활성/잠금 상태로 표시)
→ 완성 후 모습을 미리 볼 수 있고, Bolt마다 잠금 해제 느낌

B) 구현된 항목만 표시 (Bolt마다 메뉴 점진적 추가)
→ 현재 기능에 집중, 단순함 유지

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: B

---

### Question 3

UI 컴포넌트 라이브러리를 사용할까요?
Tailwind CSS만으로도 충분하지만, 버튼·테이블·모달 등 공통 컴포넌트를 라이브러리로 빠르게 구성할 수 있습니다.

A) shadcn/ui 사용 (Tailwind 기반, 컴포넌트 소유권, Next.js 궁합 최상)

B) Tailwind CSS만 사용 (외부 라이브러리 의존성 없음, 직접 스타일링)

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: B
