import { grantPromotionReward } from "@apps-in-toss/web-framework";
import { useState } from "react";
import { redeemMissionPoints } from "../lib/mission";
import { getPromotionRewardId } from "../lib/promotion";
import { trackClick } from "../lib/track";
import { useAuthStore } from "../store/useAuthStore";
import { useMissionStore } from "../store/useMissionStore";

/**
 * 누적 포인트 → 토스 포인트 redeem 흐름.
 *
 * 1) `grantPromotionReward` SDK 호출 (클라 → 토스앱)
 * 2) 성공 시 서버 `/missions/redeem` 으로 누적 차감
 * 3) 실패는 alert 로 안내, 누적은 그대로 유지
 */
export function useRedeemPoints(source: "home" | "result") {
  const [redeeming, setRedeeming] = useState(false);

  const redeem = async () => {
    if (redeeming) return;
    const pendingPoints = useMissionStore.getState().pendingPoints;
    if (pendingPoints <= 0) return;
    const promotionCode = getPromotionRewardId();
    if (!promotionCode) return;
    const hash = useAuthStore.getState().hash;
    if (!hash) return;
    if (typeof grantPromotionReward !== "function") {
      window.alert(
        "이 환경에서는 토스 포인트 발행을 지원하지 않아요. 토스 앱에서 다시 열어주세요.",
      );
      return;
    }

    setRedeeming(true);
    trackClick("press_redeem_points", { pending: pendingPoints, source });
    try {
      const result = await grantPromotionReward({
        params: { promotionCode, amount: pendingPoints },
      });

      if (!result) {
        window.alert(
          "토스 앱이 최신 버전이 아니에요. 업데이트 후 다시 시도해 주세요.",
        );
        trackClick("redeem_points_unsupported", { pending: pendingPoints });
        return;
      }
      if (result === "ERROR") {
        window.alert(
          "토스 포인트 발행에 실패했어요. 잠시 후 다시 시도해 주세요.",
        );
        trackClick("redeem_points_failed", { reason: "ERROR" });
        return;
      }
      if ("errorCode" in result) {
        window.alert(`토스 포인트 발행 실패: ${result.message}`);
        trackClick("redeem_points_failed", {
          reason: result.errorCode,
        });
        return;
      }

      // success — { key }
      trackClick("redeem_points_success", {
        amount: pendingPoints,
        key: result.key,
      });
      const after = await redeemMissionPoints(
        hash,
        pendingPoints,
        result.key,
      );
      if (after) {
        useMissionStore.getState().setStatus(after);
      }
      window.alert(
        `💎 ${pendingPoints}원이 토스 포인트로 적립됐어요!`,
      );
    } catch (err) {
      console.warn("[redeem] threw", err);
      window.alert("토스 포인트 발행 중 오류가 발생했어요.");
    } finally {
      setRedeeming(false);
    }
  };

  return { redeeming, redeem };
}
