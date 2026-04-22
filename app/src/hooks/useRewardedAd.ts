import {
  getOperationalEnvironment,
  loadFullScreenAd,
  showFullScreenAd,
} from "@apps-in-toss/web-framework";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 보상형 광고 그룹 ID.
 * - 테스트용: `ait-ad-test-rewarded-id` (공식 가이드 권장)
 * - 프로덕션: 앱인토스 콘솔에서 발급받은 ID를 `VITE_AD_GROUP_ID_REWARDED`
 *   환경변수로 주입 (app/.env.local 등).
 */
const TEST_AD_GROUP_ID = "ait-ad-test-rewarded-id";
const PROD_AD_GROUP_ID = import.meta.env.VITE_AD_GROUP_ID_REWARDED as
  | string
  | undefined;

/** 모의 광고 재생 시간(ms) — 개발/브라우저에서만 사용 */
const MOCK_AD_DURATION_MS = 2500;

function resolveAdGroupId(): { id: string; isTest: boolean } {
  if (!PROD_AD_GROUP_ID) return { id: TEST_AD_GROUP_ID, isTest: true };
  if (import.meta.env.DEV) return { id: TEST_AD_GROUP_ID, isTest: true };
  try {
    if (getOperationalEnvironment() === "sandbox") {
      return { id: TEST_AD_GROUP_ID, isTest: true };
    }
  } catch {
    return { id: TEST_AD_GROUP_ID, isTest: true };
  }
  return { id: PROD_AD_GROUP_ID, isTest: false };
}

export type AdState =
  | "unsupported"
  | "loading"
  | "ready"
  | "showing"
  | "mock-showing"
  | "error";

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

function sdkIsAvailable(): boolean {
  return (
    safeIsSupported(loadFullScreenAd) && safeIsSupported(showFullScreenAd)
  );
}

export function useRewardedAd() {
  const isMock = !sdkIsAvailable() && import.meta.env.DEV;
  const [state, setState] = useState<AdState>(
    isMock ? "ready" : "loading",
  );
  const [adGroupInfo] = useState(() => resolveAdGroupId());
  const adGroupId = adGroupInfo.id;
  const mockTimerRef = useRef<number | null>(null);

  const loadAd = useCallback(() => {
    if (isMock) {
      setState("ready");
      return () => {};
    }
    if (!sdkIsAvailable()) {
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
  }, [adGroupId, isMock]);

  useEffect(() => {
    const unregister = loadAd();
    return () => {
      unregister();
      if (mockTimerRef.current !== null) {
        window.clearTimeout(mockTimerRef.current);
        mockTimerRef.current = null;
      }
    };
  }, [loadAd]);

  const show = useCallback(
    (onReward: () => void, onDismissed?: () => void) => {
      if (isMock) {
        // 개발 모드 모의 광고: 일정 시간 후 보상 지급
        setState("mock-showing");
        mockTimerRef.current = window.setTimeout(() => {
          mockTimerRef.current = null;
          onReward();
          setState("ready");
        }, MOCK_AD_DURATION_MS);
        return;
      }
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
    [state, loadAd, adGroupId, isMock],
  );

  return {
    state,
    ready: state === "ready",
    supported: state !== "unsupported",
    isMock,
    mockShowing: state === "mock-showing",
    mockDurationMs: MOCK_AD_DURATION_MS,
    isTest: adGroupInfo.isTest,
    show,
  };
}
