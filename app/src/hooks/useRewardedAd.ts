import {
  getOperationalEnvironment,
  loadFullScreenAd,
  showFullScreenAd,
} from "@apps-in-toss/web-framework";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 보상형 광고 그룹 ID.
 *
 * - 테스트용: `ait-ad-test-rewarded-id`
 *   (https://developers-apps-in-toss.toss.im/ads/develop.html#테스트하기)
 *   개발/샌드박스 환경에서 이 ID로 호출하면 토스 SDK가 실제 테스트 광고를
 *   서빙해줘요.
 * - 프로덕션: 앱인토스 콘솔 → 수익화 → 인앱 광고에서 **리워드형**으로 발급한
 *   광고 그룹 ID를 `PROD_AD_GROUP_ID`에 그대로 붙이면 돼요. 광고 그룹 ID는
 *   공개 식별자라 git에 커밋해도 보안상 문제 없어요.
 *
 * 런타임에 다음 경우에는 **자동으로 테스트 ID**로 전환되어 실수로 개발 중
 * 실광고가 노출되는 것을 막아줘요:
 *   - Vite dev 빌드 (`npm run dev`)
 *   - 앱인토스 샌드박스 환경 런타임
 *   - `PROD_AD_GROUP_ID`가 빈 값일 때
 */
const TEST_AD_GROUP_ID = "ait-ad-test-rewarded-id";
const PROD_AD_GROUP_ID = ""; // TODO: 콘솔에서 발급한 리워드 광고 그룹 ID 붙여넣기

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
  const [state, setState] = useState<AdState>("loading");
  const [adGroupInfo] = useState(() => resolveAdGroupId());
  const adGroupId = adGroupInfo.id;
  /** show()을 호출했을 때 아직 ready가 아니면 load 완료 후 자동 show */
  const pendingShowRef = useRef<{
    onReward: () => void;
    onDismissed?: () => void;
  } | null>(null);

  const showLoadedAd = useCallback(
    (onReward: () => void, onDismissed?: () => void) => {
      if (!safeIsSupported(showFullScreenAd)) {
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
              // 다음 광고 미리 로드
              if (sdkIsAvailable()) {
                safeCall(loadFullScreenAd, {
                  options: { adGroupId },
                  onEvent: (e) => {
                    if (e.type === "loaded") setState("ready");
                  },
                  onError: () => setState("error"),
                });
              }
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
    [adGroupId],
  );

  useEffect(() => {
    if (!sdkIsAvailable()) {
      setState("unsupported");
      return;
    }
    setState("loading");
    const unregister = safeCall(loadFullScreenAd, {
      options: { adGroupId },
      onEvent: (event) => {
        if (event.type === "loaded") {
          setState("ready");
          // 대기 중인 show 요청이 있으면 즉시 실행
          const pending = pendingShowRef.current;
          if (pending) {
            pendingShowRef.current = null;
            showLoadedAd(pending.onReward, pending.onDismissed);
          }
        }
      },
      onError: (err) => {
        console.warn("[ad] load failed", err);
        setState("error");
        const pending = pendingShowRef.current;
        pendingShowRef.current = null;
        pending?.onDismissed?.();
      },
    });
    if (unregister === null) {
      setState("unsupported");
      return;
    }
    return () => unregister();
  }, [adGroupId, showLoadedAd]);

  const show = useCallback(
    (onReward: () => void, onDismissed?: () => void) => {
      if (!sdkIsAvailable()) {
        onDismissed?.();
        return;
      }
      if (state === "ready") {
        showLoadedAd(onReward, onDismissed);
        return;
      }
      if (state === "loading") {
        // 로드 완료를 기다려서 자동으로 show
        pendingShowRef.current = { onReward, onDismissed };
        return;
      }
      onDismissed?.();
    },
    [state, showLoadedAd],
  );

  return {
    state,
    ready: state === "ready",
    loading: state === "loading",
    supported: state !== "unsupported",
    isTest: adGroupInfo.isTest,
    show,
  };
}
