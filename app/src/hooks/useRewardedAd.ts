import {
  getOperationalEnvironment,
  loadFullScreenAd,
  showFullScreenAd,
} from "@apps-in-toss/web-framework";
import { useCallback, useEffect, useState } from "react";

/**
 * 보상형 광고 그룹 ID.
 * - 테스트용: `ait-ad-test-rewarded-id` (공식 가이드 권장)
 * - 프로덕션: 앱인토스 콘솔에서 발급받은 ID를 `VITE_AD_GROUP_ID_REWARDED`
 *   환경변수로 주입 (app/.env.local 등).
 *
 * 실제 프로덕션 ID가 있어도 다음 조건에서는 테스트 ID를 씁니다 —
 * 1) Vite dev 빌드(`npm run dev`)
 * 2) 앱인토스 샌드박스 환경 (`getOperationalEnvironment() === 'sandbox'`)
 *
 * 이렇게 하면 실제 광고 키가 개발 도중 노출되어 정책 위반으로
 * 불이익을 받는 것을 예방할 수 있어요.
 */
const TEST_AD_GROUP_ID = "ait-ad-test-rewarded-id";
const PROD_AD_GROUP_ID = import.meta.env.VITE_AD_GROUP_ID_REWARDED as
  | string
  | undefined;

function resolveAdGroupId(): { id: string; isTest: boolean } {
  if (!PROD_AD_GROUP_ID) return { id: TEST_AD_GROUP_ID, isTest: true };
  if (import.meta.env.DEV) return { id: TEST_AD_GROUP_ID, isTest: true };
  try {
    if (getOperationalEnvironment() === "sandbox") {
      return { id: TEST_AD_GROUP_ID, isTest: true };
    }
  } catch {
    // SDK가 환경을 판정할 수 없으면 안전하게 테스트 ID
    return { id: TEST_AD_GROUP_ID, isTest: true };
  }
  return { id: PROD_AD_GROUP_ID, isTest: false };
}

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
  const [adGroupInfo] = useState(() => resolveAdGroupId());
  const adGroupId = adGroupInfo.id;

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
      options: { adGroupId },
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
  }, [adGroupId]);

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
        options: { adGroupId },
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
    [state, loadAd, adGroupId],
  );

  return {
    state,
    ready: state === "ready",
    supported: state !== "unsupported",
    isTest: adGroupInfo.isTest,
    show,
  };
}
