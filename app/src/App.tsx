import { useEffect } from "react";
import { AuthSplash } from "./components/AuthSplash";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { BattleScreen } from "./screens/BattleScreen";
import { ChapterMapScreen } from "./screens/ChapterMapScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { StageScreen } from "./screens/StageScreen";
import { useAppStore } from "./store/useAppStore";
import { useAuthStore } from "./store/useAuthStore";
import "./App.css";

function App() {
  const screen = useAppStore((s) => s.screen);
  const authStatus = useAuthStore((s) => s.status);
  const authHash = useAuthStore((s) => s.hash);
  const authInit = useAuthStore((s) => s.init);

  useEffect(() => {
    authInit();
  }, [authInit]);

  // 첫 진입(저장된 hash 없음 + 인증 시도 중)일 때만 splash.
  // 재진입이거나 인증이 끝났으면 곧장 메인.
  const showSplash = !authHash && authStatus === "loading";

  if (showSplash) {
    return <AuthSplash />;
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
