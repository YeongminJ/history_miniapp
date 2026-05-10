import { grantPromotionReward } from "@apps-in-toss/web-framework";
import { useState } from "react";
import { redeemMissionPoints } from "../lib/mission";
import { getPromotionRewardId } from "../lib/promotion";
import { trackClick } from "../lib/track";
import { useAuthStore } from "../store/useAuthStore";
import { REDEEM_THRESHOLD, useMissionStore } from "../store/useMissionStore";
import { useInterstitialAd } from "./useInterstitialAd";

/**
 * 누적 포인트 → 토스 포인트 redeem 흐름.
 *
 * 1) 광고 인스턴스 load → show
 * 2) 광고 시청 완료 시 `grantPromotionReward` SDK 호출
 * 3) 성공 시 서버 `/missions/redeem` 으로 누적 차감
 * 4) 모든 단계 실패는 alert 로 안내, 누적은 그대로 유지
 */
export function useRedeemPoints(source: "home" | "result") {
  const [redeeming, setRedeeming] = useState(false);
  const ad = useInterstitialAd();

  const grantAndPersist = async (amount: number, hash: string) => {
    const promotionCode = getPromotionRewardId();
    if (!promotionCode) return;
    if (typeof grantPromotionReward !== "function") {
      window.alert(
        "이 환경에서는 토스 포인트 발행을 지원하지 않아요. 토스 앱에서 다시 열어주세요.",
      );
      return;
    }
    const result = await grantPromotionReward({
      params: { promotionCode, amount },
    });

    if (!result) {
      window.alert(
        "토스 앱이 최신 버전이 아니에요. 업데이트 후 다시 시도해 주세요.",
      );
      trackClick("redeem_points_unsupported", { pending: amount });
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
      trackClick("redeem_points_failed", { reason: result.errorCode });
      return;
    }

    // success — { key }. 토스 앱이 자체 적립 알림을 띄우므로 별도 alert 안 함.
    trackClick("redeem_points_success", {
      amount,
      key: result.key,
    });
    const after = await redeemMissionPoints(hash, amount, result.key);
    if (after) {
      useMissionStore.getState().setStatus(after);
    }
  };

  const redeem = () => {
    if (redeeming) return;
    const pendingPoints = useMissionStore.getState().pendingPoints;
    if (pendingPoints < REDEEM_THRESHOLD) return;
    if (!getPromotionRewardId()) return;
    const hash = useAuthStore.getState().hash;
    if (!hash) return;

    setRedeeming(true);
    trackClick("press_redeem_points", { pending: pendingPoints, source });

    ad.show(
      async () => {
        try {
          await grantAndPersist(pendingPoints, hash);
        } catch (err) {
          console.warn("[redeem] grant flow threw", err);
          window.alert("토스 포인트 발행 중 오류가 발생했어요.");
        } finally {
          setRedeeming(false);
        }
      },
      () => {
        window.alert(
          "광고를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
        );
        trackClick("redeem_ad_failed", { pending: pendingPoints });
        setRedeeming(false);
      },
    );
  };

  return { redeeming, redeem };
}
