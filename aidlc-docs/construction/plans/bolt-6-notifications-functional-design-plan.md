# Functional Design Plan — bolt-6-notifications

## 실행 체크리스트

- [x] 사용자 질문 수집
- [x] business-logic-model.md 생성
- [x] business-rules.md 생성
- [x] frontend-components.md 생성

---

## 단위(Unit) 범위 — SPEC.md FR-07, FR-11

**Unit**: bolt-6-notifications
**포함 기능**:

- 웹푸시 구독 (고객이 알림 허용 → 구독 저장)
- 예약 리마인더 발송 (웹푸시)
- (선택) 재방문 권유 발송

**전제**: Bolt 4 service worker(sw.js), 고객 인증/연결, 예약(Bolt 5) 완료.

---

## 웹푸시 구조 (참고)

```
[고객 브라우저] 알림 허용 → PushManager.subscribe(VAPID public key)
    → 구독 정보(endpoint, keys)를 DB(push_subscriptions)에 저장
[서버] web-push 라이브러리 + VAPID 키로 발송
    → 푸시 서비스 → [고객 sw.js] push 이벤트 → 알림 표시
```

**필요 설정 (사용자 작업)**:

- VAPID 키 쌍 생성 (web-push generate-vapid-keys)
- 환경변수: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, NEXT_PUBLIC_VAPID_PUBLIC_KEY

---

## 사전 결정 사항 (질문 불필요)

| 항목          | 결정                                              | 근거    |
| ------------- | ------------------------------------------------- | ------- |
| 푸시 프로토콜 | Web Push API + VAPID                              | SPEC.md |
| 라이브러리    | web-push (서버)                                   | 표준    |
| 구독 저장     | push_subscriptions 테이블 (마이그레이션 007)      | —       |
| SW 확장       | Bolt 4 sw.js에 push/notificationclick 핸들러 추가 | —       |

---

## 설계 질문

`[Answer]:` 뒤에 알파벳을 입력해주세요. 완료 후 "완료"라고 알려주세요.

---

### Question 1

리마인더 발송 방식을 어떻게 할까요?

A) 수동 발송 (Admin이 예약 상세/목록에서 "리마인더 보내기" 버튼 클릭)
(SPEC.md "1차는 수동 발송" — 가장 단순, 스케줄러 불필요)

B) 자동 발송 (예약 X시간 전 자동 — Vercel Cron 등 스케줄러 필요)
(편리하지만 Cron 설정 + 배포 환경 의존)

C) 둘 다 (수동 버튼 + 자동 스케줄)

D) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: B

---

### Question 2

이번 Bolt에서 다룰 알림 종류는?

A) 예약 리마인더만 (확정된 예약 전 알림)

B) 예약 리마인더 + 재방문 권유 (재방문 권장일 도래 고객에게)

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: A

---

### Question 3

(Q1에서 자동을 선택한 경우) 예약 몇 시간 전에 리마인더를 보낼까요?
(수동만 선택했다면 D로 답해주세요)

A) 예약 하루 전 (24시간 전)

B) 예약 당일 아침 (예: 오전 9시)

C) 예약 2시간 전

D) 해당 없음 (수동 발송만)

[Answer]: A

---

### Question 4

웹푸시 구독 동의를 어디서 받을까요?

A) 마이페이지에 "알림 받기" 버튼 (고객이 직접 켜기)

B) 첫 로그인/예약 후 자동으로 권한 요청 팝업

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: B

---

### Question 5

이번 Bolt 6 범위를 어떻게 할까요?
(웹푸시는 VAPID 키 생성 등 외부 설정이 필요하고, iOS Safari는 PWA 설치 후에만 푸시 지원 등 제약이 있습니다)

A) 전체 구현 (구독 + 발송) — 코드 완성, VAPID 설정은 가이드 제공

B) 구독 인프라만 먼저 (구독 저장 + SW 핸들러), 발송은 다음에

C) 기타 (아래 [Answer]: 뒤에 직접 설명해주세요)

[Answer]: A
