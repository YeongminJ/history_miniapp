import { appLogin } from "@apps-in-toss/web-framework";
import { useEffect, useRef } from "react";
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

interface MappingStatus {
  isMapped: boolean;
  name: string | null;
}

async function checkServerMapping(hash: string): Promise<MappingStatus> {
  const empty: MappingStatus = { isMapped: false, name: null };
  if (!REMINDER_API_BASE) return empty;
  try {
    const res = await fetch(
      `${REMINDER_API_BASE}/api/auth/migration/status`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash }),
      },
    );
    if (!res.ok) return empty;
    const data = (await res.json().catch(() => null)) as
      | { isMapped?: boolean; name?: string | null }
      | null;
    return {
      isMapped: !!data?.isMapped,
      name: data?.name ?? null,
    };
  } catch (err) {
    console.warn("[mapping-check] failed", err);
    return empty;
  }
}

/**
 * Stale toss_user_key 회복 — cron 이 4010 받고 서버에서 toss_user_key 를 NULL 로 비웠을 때,
 * 클라에서 1회 silent appLogin 해서 재매핑. 이미 동의한 사용자는 토스 UI 안 뜨고 즉시 코드 발급.
 * 매핑 성공 시 새로 받은 name 반환 (없으면 null).
 */
async function recoverMapping(hash: string): Promise<string | null> {
  if (!REMINDER_API_BASE) return null;
  if (typeof appLogin !== "function") return null;
  let result: { authorizationCode?: string; referrer?: string } | null;
  try {
    result = await appLogin();
  } catch (err) {
    console.warn("[recovery] appLogin failed", err);
    return null;
  }
  if (!result?.authorizationCode || !result?.referrer) return null;
  try {
    const res = await fetch(`${REMINDER_API_BASE}/api/auth/migration/link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hash,
        authorizationCode: result.authorizationCode,
        referrer: result.referrer,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json().catch(() => null)) as
      | { name?: string | null }
      | null;
    return data?.name ?? null;
  } catch (err) {
    console.warn("[recovery] link failed", err);
    return null;
  }
}

function App() {
  const screen = useAppStore((s) => s.screen);
  const authStatus = useAuthStore((s) => s.status);
  const authHash = useAuthStore((s) => s.hash);
  const authInit = useAuthStore((s) => s.init);
  const onboardingDone = useOnboardingStore((s) => s.completed);
  const completeOnboarding = useOnboardingStore((s) => s.complete);
  const setName = useAuthStore((s) => s.setName);
  const mappingCheckedRef = useRef(false);

  useEffect(() => {
    authInit();
  }, [authInit]);

  // hash 로드 후 서버 매핑 상태에 따라 분기 (1회만).
  // - onboarding 미완료 + isMapped → 자동 완료 (다른 deeplink/스킴에서 진입한 경우)
  // - onboarding 완료 + !isMapped → silent appLogin 으로 재매핑 (cron 이 4010 받아 stale 처리한 키)
  useEffect(() => {
    if (!authHash) return;
    if (mappingCheckedRef.current) return;
    mappingCheckedRef.current = true;
    let cancelled = false;
    void (async () => {
      const status = await checkServerMapping(authHash);
      if (cancelled) return;
      if (status.name) setName(status.name);
      if (!onboardingDone && status.isMapped) {
        completeOnboarding();
      } else if (onboardingDone && !status.isMapped) {
        const recoveredName = await recoverMapping(authHash);
        if (cancelled) return;
        if (recoveredName) setName(recoveredName);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authHash, onboardingDone, completeOnboarding, setName]);

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
