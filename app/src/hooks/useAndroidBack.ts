import { graniteEvent } from "@apps-in-toss/web-framework";
import { useEffect, useRef } from "react";

/**
 * 안드로이드 백키(또는 Toss 인앱 백 이벤트)를 가로채 화면 내 이전 이동에 사용.
 *
 * - 스크린 컴포넌트 mount 시 핸들러 등록, unmount 시 자동 해제
 * - 동시에 화면 1개만 렌더링되는 SPA 구조이므로 가장 안쪽 화면의 핸들러가 활성
 * - 등록 안 한 화면(예: home)은 Toss 기본 동작(앱 종료 확인)으로 폴백
 * - Toss SDK 미지원 환경(웹 단독 미리보기 등)에서는 조용히 no-op
 */
export function useAndroidBack(handler: () => void): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = graniteEvent.addEventListener("backEvent", {
        onEvent: () => {
          handlerRef.current();
        },
      });
    } catch (err) {
      console.warn("[useAndroidBack] graniteEvent unavailable", err);
    }
    return () => unsubscribe?.();
  }, []);
}
