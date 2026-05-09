/**
 * 토스 프로모션(토스 포인트) 활성화 게이트.
 *
 * `.env` 의 `VITE_TOSS_PROMOTION_REWARD_ID` 가 채워졌을 때만 true.
 * 콘솔 검토 통과 + reward_id 발급 후 환경변수에 채우고 재배포하면
 * 미션 카드(홈/결과) + 서버 status fetch 가 일제히 활성화돼요.
 */
export function getPromotionRewardId(): string | null {
  const raw = import.meta.env.VITE_TOSS_PROMOTION_REWARD_ID as
    | string
    | undefined;
  const trimmed = (raw ?? "").trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function isPromotionEnabled(): boolean {
  return getPromotionRewardId() !== null;
}
