/**
 * Cloudflare Workers 바인딩 / 환경변수 타입.
 * `wrangler.toml`의 binding 이름과 1:1 매칭.
 */
export interface Env {
  /** D1 SQLite 데이터베이스 */
  DB: D1Database;

  /** mock | real — Toss API 모드 */
  TOSS_MODE: "mock" | "real";

  /** mTLS 인증서 바인딩 — `env.TOSS_CERT.fetch(...)`로 호출 시 자동 attach. */
  TOSS_CERT?: Fetcher;

  /** 토스 콘솔에 등록한 'daily' 푸시 템플릿 코드. */
  TOSS_TEMPLATE_DAILY?: string;

  /** 토스 콘솔에 등록한 'streak_warn' 푸시 템플릿 코드. */
  TOSS_TEMPLATE_STREAK_WARN?: string;

  /**
   * 토스 user_name 등 PII 복호화 키 (base64-encoded 32 bytes, AES-256-GCM).
   * 콘솔 발급 → `wrangler secret put TOSS_USER_INFO_KEY` 로 등록.
   */
  TOSS_USER_INFO_KEY?: string;

  /** 토스 user 정보 복호화 AAD 문자열. `wrangler secret put TOSS_USER_INFO_AAD` 로 등록. */
  TOSS_USER_INFO_AAD?: string;
}
