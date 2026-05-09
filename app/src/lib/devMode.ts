import { getOperationalEnvironment } from "@apps-in-toss/web-framework";

/**
 * 개발 모드 여부.
 * - Vite dev 빌드 (`npm run dev`) → true
 * - 토스 샌드박스 환경 → true
 * - `VITE_SHOW_DEV_TOOLS=1` 빌드 환경변수 → true
 *   (intoss-private 배포 단계에서 일반 토스앱에서도 dev 도구 보고 싶을 때 사용)
 *
 * 일반 출시(공개 배포) 전에 `.env`에서 `VITE_SHOW_DEV_TOOLS` 제거하면 자동으로 숨겨짐.
 */
export function isDevMode(): boolean {
  if (import.meta.env.DEV) return true;
  if (import.meta.env.VITE_SHOW_DEV_TOOLS === "1") return true;
  try {
    return getOperationalEnvironment() === "sandbox";
  } catch {
    return false;
  }
}
