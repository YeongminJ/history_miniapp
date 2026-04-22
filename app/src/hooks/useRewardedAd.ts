import {
  loadFullScreenAd,
  showFullScreenAd,
} from "@apps-in-toss/web-framework";
import { useCallback, useEffect, useState } from "react";

// TODO: 프로덕션 광고 그룹 ID로 교체 (현재는 공식 문서의 테스트 ID)
const AD_GROUP_ID = "ait.dev.43daa14da3ae487b";

type AdState = "unsupported" | "loading" | "ready" | "showing" | "error";

/**
 * SDK의 `isSupported()`는 토스 샌드박스 환경이 아닐 때
 * `__CONSTANT_HANDLER_MAP`에 키가 없어서 throw 해요. 브라우저 개발 중엔
 * 이 예외로 화면이 통째로 꺼지므로 try/catch로 안전하게 감싸요.
 */
function safeIsSupported(
  fn: { isSupported?: () => boolean } | undefined,
): boolean {
  if (!fn || typeof fn.isSupported !== "function") return false;
  try {
    return fn.isSupported();
  } catch {
    return false;
  }
}

function safeCall<T extends (...args: never[]) => unknown>(
  fn: T | undefined,
  ...args: Parameters<T>
): ReturnType<T> | null {
  if (typeof fn !== "function") return null;
  try {
    return fn(...args) as ReturnType<T>;
  } catch (err) {
    console.warn("[ad] SDK call failed", err);
    return null;
  }
}

export function useRewardedAd() {
  const [state, setState] = useState<AdState>("loading");

  const loadAd = useCallback(() => {
    if (
      !safeIsSupported(loadFullScreenAd) ||
      !safeIsSupported(showFullScreenAd)
    ) {
      setState("unsupported");
      return () => {};
    }
    setState("loading");
    const unregister = safeCall(loadFullScreenAd, {
      options: { adGroupId: AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === "loaded") setState("ready");
      },
      onError: (err) => {
        console.warn("[ad] load failed", err);
        setState("error");
      },
    });
    if (unregister === null) {
      setState("unsupported");
      return () => {};
    }
    return unregister;
  }, []);

  useEffect(() => {
    const unregister = loadAd();
    return () => unregister();
  }, [loadAd]);

  const show = useCallback(
    (onReward: () => void, onDismissed?: () => void) => {
      if (state !== "ready" || !safeIsSupported(showFullScreenAd)) {
        onDismissed?.();
        return;
      }
      setState("showing");
      let rewarded = false;
      const result = safeCall(showFullScreenAd, {
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
      if (result === null) {
        setState("unsupported");
        onDismissed?.();
      }
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
