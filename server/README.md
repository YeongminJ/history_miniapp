# history-king-noti-api

역사왕(`my-history-king`) 미니앱의 푸시 알림 백엔드. **Cloudflare Workers + D1 + Cron Triggers** 기반.

## 무엇을 하나

- 미니앱 클라이언트가 등록한 사용자별 알림 시간을 저장
- 클라가 문제 풀이 완료 시 `/api/users/:userKey/play`로 플레이 트래킹 (스트릭 계산)
- 매 분(KST) cron으로 도래한 사용자에게 토스 스마트 발송 호출
  - 오늘 이미 플레이 → 발송 안 함
  - 어제 플레이 + 활성 스트릭 → **스트릭 끊김 경고**
  - 그 외 → **데일리 리마인드**
- 같은 (사용자, 날짜, 타입) 중복 발송 방지

> 토스 mTLS 인증서 도착 전까지는 mock 클라이언트로 동작 (콘솔 로그). `wrangler tail`로 모니터링.

## 셋업 (최초 1회)

```bash
cd server
npm install

# Wrangler 로그인 (Cloudflare 계정)
npx wrangler login

# D1 데이터베이스 생성 → 출력된 database_id를 wrangler.toml에 채워주세요
npx wrangler d1 create history-king-noti-db

# 마이그레이션 적용 (로컬 + 원격)
npm run db:migrate:local
npm run db:migrate:remote
```

## 개발

```bash
# 로컬 dev (miniflare 기반, D1 자동 격리)
npm run dev

# 사용자 등록
curl -X POST http://localhost:8787/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "userKey":"test-user-1",
    "reminderMinute":1260,
    "dailyEnabled":true,
    "streakWarnEnabled":true
  }'

# 플레이 기록 (스트릭 갱신)
curl -X PATCH http://localhost:8787/api/users/test-user-1/play \
  -H "Content-Type: application/json" \
  -d '{}'

# 사용자 조회
curl http://localhost:8787/api/users/test-user-1

# 헬스체크
curl http://localhost:8787/api/health

# Cron 수동 발화 테스트
npm run dev:scheduled
# 다른 터미널: curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"
```

## 배포

```bash
npm run db:migrate:remote   # 원격 D1에 마이그레이션
npm run deploy              # Workers 배포
npm run tail                # 실시간 로그 확인 (cron 발화 모니터링)
```

배포 후 엔드포인트: `https://history-king-noti-api.<your-cf-account>.workers.dev`

## 엔드포인트

| Method   | Path                       | 설명                                   |
| -------- | -------------------------- | -------------------------------------- |
| `POST`   | `/api/users`               | 사용자 등록/업데이트 (알림 설정)       |
| `PATCH`  | `/api/users/:userKey/play` | 플레이 기록 + 스트릭 갱신              |
| `DELETE` | `/api/users`               | 사용자 + 발송이력 삭제 (opt-out)       |
| `GET`    | `/api/users/:userKey`      | 디버그용 조회                          |
| `GET`    | `/api/health`              | 헬스체크                               |

`POST /api/users` 페이로드:

```ts
{
  userKey: string,                  // Toss getAnonymousKey() 결과
  reminderMinute: number | null,    // 0..1439 KST 분, null=비활성
  dailyEnabled?: boolean,           // 기본 true
  streakWarnEnabled?: boolean,      // 기본 true
  timezone?: string                 // 기본 'Asia/Seoul'
}
```

`PATCH /api/users/:userKey/play` 페이로드:

```ts
{
  playedAt?: number    // epoch ms, 생략 시 서버 현재 시각
}
```

스트릭 계산: `lastPlayedAt`의 KST 날짜와 `playedAt`의 KST 날짜를 비교 →
같은 날 = 유지, 어제 = +1, 그 외 = 1로 리셋.

## Cron

- 스케줄: `* * * * *` (매 분, UTC)
- 핸들러: `src/cron/tick.ts`의 `runTick`
- 동작: 현재 KST 분 = `users.reminder_minute` 사용자 대상으로 발송 타입 결정 후 토스 sendMessage

## 토스 mTLS 활성화 (인증서 도착 후)

1. 콘솔에서 클라 인증서·개인키 발급
2. `wrangler mtls-certificate upload --cert toss.crt --key toss.key --name toss-prod`
3. 출력된 `certificate_id`를 [wrangler.toml](./wrangler.toml)의 `[[mtls_certificates]]` 블록에 넣고 주석 해제
4. `src/toss/real.ts` 작성 (fetch 시 `cf: { mtlsCertificateId }` 옵션 사용)
5. `src/toss/factory.ts`에서 real 클라이언트 import
6. `wrangler.toml`의 `TOSS_MODE = "real"`로 변경
7. `npm run deploy`

## 관측

```bash
# 실시간 로그 (cron 발화 + sendMessage 로그)
npm run tail

# D1 콘솔
npx wrangler d1 execute history-king-noti-db \
  --command "SELECT * FROM users LIMIT 10" --remote

npx wrangler d1 execute history-king-noti-db \
  --command "SELECT * FROM notifications ORDER BY sent_at DESC LIMIT 20" --remote
```

## 다른 미니앱과 D1 공유에 대해

`daily_sunguard`의 `suncream-noti-db`와는 **별도 DB로 분리**돼요.

이유:
- 두 앱 모두 `users` 테이블이 있지만 의미가 다름 (선크림용 vs 역사왕용)
- 각자의 drizzle migration이 서로의 변경을 모름 → 한쪽이 다른 쪽 스키마를 깰 위험
- D1 무료 쿼터(5M reads/일) 격리 필요

같은 Cloudflare 계정에 두 Worker + 두 DB로 운영하는 게 안전해요. 무료 플랜 한도(D1 10개, Workers 무제한)는 충분.
