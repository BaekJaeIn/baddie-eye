# 요구사항 확인 질문 (Bolt 1)

SPEC.md를 읽었습니다. 대부분의 방향이 잘 정리되어 있어서 Bolt 1 구현 전에 아래 몇 가지만 확인하겠습니다.
모든 질문에 `[Answer]:` 태그 뒤에 알파벳 선택지로 답변해주세요. 완료되면 "다 했어" 또는 "완료"라고 알려주세요.

---

## Question 1

Admin(원장) 로그인 방식을 어떻게 구현할까요?

A) 이메일 + 비밀번호 (Supabase Auth 내장 기능, 가장 단순)

B) Google OAuth (소셜 로그인, Supabase Auth 지원)

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: A

---

## Question 2

Supabase 프로젝트 상태는 어떻게 되나요?

A) 아직 없음 — 새로 만들어야 함

B) 이미 Supabase 프로젝트가 있음 (프로젝트 URL/키는 나중에 .env에 직접 입력할게요)

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: A

---

## Question 3

패키지 매니저 선호가 있나요?

A) npm (Node.js 기본, 가장 범용)

B) pnpm (빠르고 디스크 효율적, 모노레포에 강점)

C) yarn (안정적, 널리 쓰임)

D) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: B

---

## Question 4

Admin 계정 구조는 어떻게 할까요?

A) 단일 계정 고정 (원장 혼자만 사용, 계정 추가 기능 불필요)

B) 여러 Admin 계정 지원 (나중에 직원 추가 가능성 고려)

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: A

---

## Question 5 — Security Extension

이 프로젝트에 보안 확장 규칙을 적용할까요?

보안 확장을 활성화하면 인증, 인가, 입력 검증, 시크릿 관리 등의 보안 기준이 코드 생성 시 강제됩니다.
고객 개인정보(이름, 연락처, 생일, 알러지 메모 등)를 다루는 프로덕션 앱이므로 권장합니다.

A) 예 — 보안 규칙을 강제 적용 (프로덕션 앱이므로 권장)

B) 아니오 — 보안 규칙 생략 (PoC/프로토타입 수준으로 우선 빠르게 진행)

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: A

---

## Question 6 — Resiliency Extension

복원력(Resiliency) 기준을 적용할까요?

AWS Well-Architected 신뢰성 원칙 기반으로 장애 허용, 고가용성, 관찰가능성 등 15개 영역의 설계 지침을 적용합니다.
1인 운영 소규모 샵 앱이고 Vercel + Supabase 관리형 서비스를 사용하므로 생략해도 무방합니다.

A) 예 — 복원력 기준 적용

B) 아니오 — 생략 (소규모 앱에 적합, Vercel/Supabase가 기본 가용성 처리)

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: B

---

## Question 7 — Property-Based Testing Extension

속성 기반 테스트(Property-Based Testing) 규칙을 적용할까요?

비즈니스 로직, 데이터 변환, 직렬화 등에 대해 자동 생성된 다양한 입력으로 테스트합니다.
단순 CRUD 위주인 Bolt 1 범위에서는 효과가 제한적일 수 있습니다.

A) 예 — PBT 규칙 강제 적용

B) 일부 — 순수 함수와 직렬화에만 적용

C) 아니오 — 생략 (CRUD 앱에 불필요)

D) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: C
