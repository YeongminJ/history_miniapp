import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/**
 * 사용자 한 명당 1행. `user_key`는 토스 `getAnonymousKey()`로 발급받은 식별자.
 *
 * 푸시 정책:
 * - `reminder_minute`이 null이면 모든 푸시 비활성화.
 * - cron이 `reminder_minute` 도래 시 한 번 발화. 발화 시점 사용자 상태에 따라
 *   (a) 데일리 리마인드 / (c) 스트릭 끊김 경고 중 하나를 선택해 발송.
 */
export const users = sqliteTable("users", {
  /** 미니앱 내부 식별자 (getAnonymousKey 결과). PK + 클라 ↔ 서버 매칭용. */
  userKey: text("user_key").primaryKey(),
  /**
   * 토스 OAuth로 받은 userKey. **푸시 라우팅 키** — sendMessage `x-toss-user-key`.
   * 첫 enable 시 appLogin → OAuth 교환으로 채움. null이면 cron 발송 대상에서 제외.
   */
  tossUserKey: text("toss_user_key"),
  /**
   * 토스 user_name scope 로 받은 사용자 이름. 공유 메시지 인사말 등 UX 에 사용.
   * 사용자가 동의하지 않거나 복호화 실패 시 null.
   */
  name: text("name"),
  /** 알림 받을 KST 분(0~1439). null이면 비활성. */
  reminderMinute: integer("reminder_minute"),
  /** 데일리 리마인드 활성 여부. */
  dailyEnabled: integer("daily_enabled", { mode: "boolean" })
    .notNull()
    .default(true),
  /** 스트릭 끊김 경고 활성 여부. */
  streakWarnEnabled: integer("streak_warn_enabled", { mode: "boolean" })
    .notNull()
    .default(true),
  /** 마지막 플레이 epoch ms. 클라가 `/api/users/:userKey/play`로 갱신. */
  lastPlayedAt: integer("last_played_at"),
  /** 현재 연속 플레이 일수. */
  currentStreak: integer("current_streak").notNull().default(0),
  timezone: text("timezone").notNull().default("Asia/Seoul"),
  /**
   * 일일 미션 누적 포인트. 클리어 시 +1, 토스 포인트로 redeem 시 -10.
   * 콘솔 프로모션 reward 발급 전까지는 단순 카운터.
   */
  pendingPoints: integer("pending_points").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

/**
 * 발송 이력. 같은 (userKey, date, type)에 대해 한 번만 sent.
 */
export const notifications = sqliteTable(
  "notifications",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userKey: text("user_key").notNull(),
    date: text("date").notNull(), // KST 'YYYY-MM-DD'
    /** 'daily' | 'streak_warn' */
    type: text("type").notNull(),
    /** 'sent' | 'failed' | 'skipped' */
    status: text("status").notNull(),
    sentAt: integer("sent_at").notNull(),
    error: text("error"),
  },
  (t) => ({
    uniq: uniqueIndex("notifications_user_date_type").on(
      t.userKey,
      t.date,
      t.type,
    ),
  }),
);

/**
 * 미션 클레임 이력. (user_key, date, type) 1회 보장.
 * type: 'daily_1' | 'daily_3' | 'daily_5' | 'combo_10' | 'streak_3' | 'streak_7' | 'streak_30'
 */
export const missionClaims = sqliteTable(
  "mission_claims",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userKey: text("user_key").notNull(),
    /** KST 'YYYY-MM-DD' */
    date: text("date").notNull(),
    /** 미션 type. 기존 daily 한 종류는 'daily_1' 로 통합. */
    type: text("type").notNull().default("daily_1"),
    /** 적립된 금액 (원). */
    amount: integer("amount").notNull().default(0),
    claimedAt: integer("claimed_at").notNull(),
  },
  (t) => ({
    uniq: uniqueIndex("mission_claims_user_date_type").on(
      t.userKey,
      t.date,
      t.type,
    ),
  }),
);
