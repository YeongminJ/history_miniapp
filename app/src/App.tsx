import { useEffect } from "react";
import { AuthSplash } from "./components/AuthSplash";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { BattleScreen } from "./screens/BattleScreen";
import { ChapterMapScreen } from "./screens/ChapterMapScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { StageScreen } from "./screens/StageScreen";
import { useAppStore } from "./store/useAppStore";
import { useAuthStore } from "./store/useAuthStore";
import { useOnboardingStore } from "./store/useOnboardingStore";
import "./App.css";

function App() {
  const screen = useAppStore((s) => s.screen);
  const authStatus = useAuthStore((s) => s.status);
  const authHash = useAuthStore((s) => s.hash);
  const authInit = useAuthStore((s) => s.init);
  const onboardingDone = useOnboardingStore((s) => s.completed);

  useEffect(() => {
    authInit();
  }, [authInit]);

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
    </ErrorBoundary>
  );
}

export default App;
