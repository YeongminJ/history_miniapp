import type { NotiType, TossClient } from "./client";

const MOCK_MESSAGES: Record<NotiType, { title: string; body: string }> = {
  daily: {
    title: "오늘의 도전",
    body: "1분이면 충분해요. 지금 풀어볼까요?",
  },
  streak_warn: {
    title: "연속출석 위험",
    body: "오늘 안에 한 문제만 풀면 이어져요.",
  },
};

/**
 * 콘솔에만 로그를 남기는 가짜 클라이언트.
 * `wrangler tail`로 발송 이벤트 모니터링 가능.
 * 토스 mTLS 인증서 발급 전까지 default 모드.
 */
export const mockTossClient: TossClient = {
  async sendMessage(input) {
    const tpl = MOCK_MESSAGES[input.type];
    console.log(
      "[MockToss] sendMessage",
      JSON.stringify({
        ts: new Date().toISOString(),
        userKey: input.userKey,
        type: input.type,
        title: tpl.title,
        body: tpl.body,
        context: input.context,
      }),
    );
    return {
      ok: true,
      messageId: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
  },
};
