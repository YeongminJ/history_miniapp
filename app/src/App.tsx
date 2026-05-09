import { useEffect } from "react";
import { AuthSplash } from "./components/AuthSplash";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { BattleScreen } from "./screens/BattleScreen";
import { ChapterMapScreen } from "./screens/ChapterMapScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { RunnerScreen } from "./screens/RunnerScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { StageScreen } from "./screens/StageScreen";
import { useAppStore } from "./store/useAppStore";
import { useAuthStore } from "./store/useAuthStore";
import { useOnboardingStore } from "./store/useOnboardingStore";
import "./App.css";

const REMINDER_API_BASE = (
  (import.meta.env.VITE_REMINDER_API_BASE as string | undefined) ?? ""
).replace(/\/$/, "");

/**
 * 서버에 이미 `toss_user_key` 매핑이 있는 사용자면 온보딩 자동 완료.
 * (다른 deploymentId/스킴에서 진입하면 localStorage가 격리될 수 있어
 *  로컬 `completed` 가 false라도 서버 기준으로 회복.)
 */
async function hydrateOnboardingFromServer(hash: string): Promise<boolean> {
  if (!REMINDER_API_BASE) return false;
  try {
    const res = await fetch(
      `${REMINDER_API_BASE}/api/auth/migration/status`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash }),
      },
    );
    if (!res.ok) return false;
    const data = (await res.json().catch(() => null)) as
      | { isMapped?: boolean }
      | null;
    return !!data?.isMapped;
  } catch (err) {
    console.warn("[onboarding-hydrate] failed", err);
    return false;
  }
}

function App() {
  const screen = useAppStore((s) => s.screen);
  const authStatus = useAuthStore((s) => s.status);
  const authHash = useAuthStore((s) => s.hash);
  const authInit = useAuthStore((s) => s.init);
  const onboardingDone = useOnboardingStore((s) => s.completed);
  const completeOnboarding = useOnboardingStore((s) => s.complete);

  useEffect(() => {
    authInit();
  }, [authInit]);

  // hash 로드된 후, 서버 매핑 상태로 온보딩 자동 완료 시도.
  useEffect(() => {
    if (!authHash || onboardingDone) return;
    let cancelled = false;
    void (async () => {
      const isMapped = await hydrateOnboardingFromServer(authHash);
      if (!cancelled && isMapped) {
        completeOnboarding();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authHash, onboardingDone, completeOnboarding]);

  // 첫 진입(저장된 hash 없음 + 인증 시도 중)일 때만 splash.
  const showSplash = !authHash && authStatus === "loading";

  if (showSplash) {
    return <AuthSplash />;
  }

  // 온보딩 미완료면 온보딩 → 그 외 메인 라우터.
  if (!onboardingDone) {
    return <OnboardingScreen />;
  }

  return (
    <ErrorBoundary>
      {screen === "home" ? <HomeScreen /> : null}
      {screen === "chapter" ? <ChapterMapScreen /> : null}
      {screen === "stage" ? <StageScreen /> : null}
      {screen === "battle" ? <BattleScreen /> : null}
      {screen === "result" ? <ResultScreen /> : null}
      {screen === "settings" ? <SettingsScreen /> : null}
      {screen === "runner" ? <RunnerScreen /> : null}
    </ErrorBoundary>
  );
}

export default App;
