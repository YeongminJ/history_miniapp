import {
  loadFullScreenAd,
  showFullScreenAd,
} from "@apps-in-toss/web-framework";
import { useCallback, useEffect, useState } from "react";

// TODO: 프로덕션 광고 그룹 ID로 교체 (현재는 공식 문서의 테스트 ID)
const AD_GROUP_ID = "ait.dev.43daa14da3ae487b";

type AdState = "unsupported" | "loading" | "ready" | "showing" | "error";

export function useRewardedAd() {
  const [state, setState] = useState<AdState>("loading");

  const loadAd = useCallback(() => {
    if (!loadFullScreenAd.isSupported?.()) {
      setState("unsupported");
      return () => {};
    }
    setState("loading");
    const unregister = loadFullScreenAd({
      options: { adGroupId: AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === "loaded") setState("ready");
      },
      onError: (err) => {
        console.warn("[ad] load failed", err);
        setState("error");
      },
    });
    return unregister;
  }, []);

  useEffect(() => {
    const unregister = loadAd();
    return () => unregister();
  }, [loadAd]);

  const show = useCallback(
    (onReward: () => void, onDismissed?: () => void) => {
      if (state !== "ready" || !showFullScreenAd.isSupported?.()) {
        onDismissed?.();
        return;
      }
      setState("showing");
      let rewarded = false;
      showFullScreenAd({
        options: { adGroupId: AD_GROUP_ID },
        onEvent: (event) => {
          switch (event.type) {
            case "userEarnedReward":
              rewarded = true;
              onReward();
              break;
            case "dismissed":
            case "failedToShow":
              setState("loading");
              loadAd();
              if (!rewarded) onDismissed?.();
              break;
          }
        },
        onError: (err) => {
          console.warn("[ad] show failed", err);
          setState("error");
          if (!rewarded) onDismissed?.();
        },
      });
    },
    [state, loadAd],
  );

  return {
    state,
    ready: state === "ready",
    supported: state !== "unsupported",
    show,
  };
}
