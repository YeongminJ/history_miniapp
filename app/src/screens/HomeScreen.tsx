import { Button, Top } from "@toss/tds-mobile";
import { useEffect, useRef, useState } from "react";
import { useRedeemPoints } from "../hooks/useRedeemPoints";
import { isDevMode } from "../lib/devMode";
import { isPromotionEnabled } from "../lib/promotion";
import { deleteReminder } from "../lib/reminder";
import { trackClick, trackScreen } from "../lib/track";
import { useAppStore } from "../store/useAppStore";
import { useAuthStore } from "../store/useAuthStore";
import { REDEEM_THRESHOLD, useMissionStore } from "../store/useMissionStore";
import { useProgressStore } from "../store/useProgressStore";

const RESET_LOCAL_KEYS = [
  "history-king-onboarding-v1",
  "history-king-reminder-v1",
  "history-king-mission-v1",
  "history-king-mission-v2",
  "history-king-notification-v1",
];

const HIDDEN_RESET_CLICK_THRESHOLD = 7;
const HIDDEN_RESET_CLICK_WINDOW_MS = 3000;

const REMINDER_API_BASE = (
  (import.meta.env.VITE_REMINDER_API_BASE as string | undefined) ?? ""
).replace(/\/$/, "");

async function performDevReset(hash: string | null): Promise<void> {
  // 1) 서버 측: toss_user_key 까지 완전 삭제 (다음 enable 시 OAuth 재트리거)
  if (hash && REMINDER_API_BASE) {
    try {
      await fetch(
        `${REMINDER_API_BASE}/reminders/${encodeURIComponent(hash)}?full=true`,
        { method: "DELETE" },
      );
    } catch (err) {
      console.warn("[dev-reset] server delete failed", err);
    }
  } else if (hash) {
    // 호환: REMINDER_API_BASE 없는 환경에서는 일반 deleteReminder 호출
    await deleteReminder(hash);
  }

  // 2) 로컬 스토리지: 온보딩·리마인더 키 제거
  for (const k of RESET_LOCAL_KEYS) {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  }

  // 3) 새로 mount 시키기 위해 페이지 리로드
  window.location.reload();
}

export function HomeScreen() {
  const navigate = useAppStore((s) => s.navigate);
  const streak = useProgressStore((s) => s.streak);
  const totalPlayed = useProgressStore((s) => s.totalPlayed);
  const totalCorrect = useProgressStore((s) => s.totalCorrect);
  const totalScore = useProgressStore((s) => s.totalScore);
  const authHash = useAuthStore((s) => s.hash);
  const pendingPoints = useMissionStore((s) => s.pendingPoints);
  const claimedTypes = useMissionStore((s) => s.claimedTypes);
  const todayClearCount = useMissionStore((s) => s.todayClearCount);
  const currentStreak = useMissionStore((s) => s.currentStreak);
  const showRunner = isDevMode();
  const showDevTools = isDevMode();
  const showMission = isPromotionEnabled();
  const [resetting, setResetting] = useState(false);
  const { redeeming, redeem: handleHomeRedeem } = useRedeemPoints("home");
  const crownClickCountRef = useRef(0);
  const crownClickTimerRef = useRef<number | null>(null);

  const handleCrownTap = () => {
    crownClickCountRef.current += 1;
    if (crownClickTimerRef.current) {
      window.clearTimeout(crownClickTimerRef.current);
    }
    crownClickTimerRef.current = window.setTimeout(() => {
      crownClickCountRef.current = 0;
    }, HIDDEN_RESET_CLICK_WINDOW_MS);

    if (crownClickCountRef.current >= HIDDEN_RESET_CLICK_THRESHOLD) {
      crownClickCountRef.current = 0;
      if (crownClickTimerRef.current) {
        window.clearTimeout(crownClickTimerRef.current);
        crownClickTimerRef.current = null;
      }
      if (resetting) return;
      const ok = window.confirm(
        "🔧 히든 리셋\n온보딩·알림·미션·서버 매핑을 모두 초기화하고 새로고침합니다. 계속할까요?",
      );
      if (!ok) return;
      setResetting(true);
      trackClick("hidden_reset_triggered", { hash: authHash });
      void performDevReset(authHash).catch((err) => {
        console.error("[hidden-reset]", err);
        setResetting(false);
      });
    }
  };

  const accuracy =
    totalPlayed > 0 ? Math.round((totalCorrect / totalPlayed) * 100) : 0;

  useEffect(() => {
    trackScreen("screen_home", {
      streak,
      total_played: totalPlayed,
      total_correct: totalCorrect,
    });
  }, [streak, totalPlayed, totalCorrect]);

  return (
    <div style={{ paddingBottom: 120 }}>
      <Top
        title={
          <Top.TitleParagraph size={28}>
            내가역사왕{" "}
            <span
              onClick={handleCrownTap}
              style={{
                cursor: "default",
                userSelect: "none",
                WebkitUserSelect: "none",
              }}
            >
              👑
            </span>
          </Top.TitleParagraph>
        }
        subtitleBottom={
          <Top.SubtitleParagraph size={17}>
            역사 속 인물을 만나 던전을 정복하세요
          </Top.SubtitleParagraph>
        }
      />

      <div style={{ padding: "8px 24px 24px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #5D4037 0%, #3E2723 100%)",
            borderRadius: 20,
            padding: 24,
            color: "#FFFFFF",
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
            연속 출석
          </div>
          <div style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.1 }}>
            🔥 {streak}일
          </div>
          <div style={{ fontSize: 13, opacity: 0.7, marginTop: 8 }}>
            오늘도 한 챕터를 정복해 보세요
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <Stat label="푼 문제" value={totalPlayed.toString()} />
          <Stat label="정답률" value={`${accuracy}%`} />
          <Stat label="누적 점수" value={totalScore.toLocaleString()} />
        </div>

        {showMission ? (
          <MissionTodayCard
            claimedTypes={claimedTypes}
            todayClearCount={todayClearCount}
            currentStreak={currentStreak}
            pendingPoints={pendingPoints}
            redeeming={redeeming}
            onRedeem={handleHomeRedeem}
          />
        ) : null}

        <Button
          size="xlarge"
          display="full"
          onClick={() => {
            trackClick("press_enter_dungeon", { streak });
            navigate("chapter");
          }}
        >
          던전 입장
        </Button>

        <button
          type="button"
          onClick={() => {
            trackClick("press_open_settings");
            navigate("settings");
          }}
          style={{
            width: "100%",
            marginTop: 12,
            padding: "12px",
            background: "transparent",
            border: "none",
            color: "#757575",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          ⚙ 학습 알림 설정
        </button>

        {showRunner ? (
          <button
            type="button"
            onClick={() => {
              trackClick("press_enter_runner", { streak });
              navigate("runner");
            }}
            style={{
              marginTop: 8,
              width: "100%",
              padding: "14px",
              border: "1.5px dashed #5D4037",
              borderRadius: 12,
              background: "transparent",
              color: "#5D4037",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            🐯 무한 추격 모드 (DEV)
          </button>
        ) : null}

        {showDevTools ? (
          <button
            type="button"
            disabled={resetting}
            onClick={async () => {
              const ok = window.confirm(
                "온보딩·알림 설정·서버 매핑을 모두 초기화합니다.\n페이지가 새로고침돼요. 계속할까요?",
              );
              if (!ok) return;
              setResetting(true);
              trackClick("dev_reset_onboarding", { hash: authHash });
              try {
                await performDevReset(authHash);
              } catch (err) {
                console.error("[dev-reset]", err);
                setResetting(false);
              }
            }}
            style={{
              marginTop: 8,
              width: "100%",
              padding: "12px",
              border: "1.5px dashed #C62828",
              borderRadius: 12,
              background: "transparent",
              color: "#C62828",
              fontSize: 13,
              fontWeight: 700,
              cursor: resetting ? "wait" : "pointer",
              opacity: resetting ? 0.6 : 1,
            }}
          >
            {resetting
              ? "리셋 중..."
              : "🔧 DEV: 온보딩 + 알림 + 서버 매핑 리셋"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function MissionTodayCard({
  claimedTypes,
  todayClearCount,
  currentStreak,
  pendingPoints,
  redeeming,
  onRedeem,
}: {
  claimedTypes: string[];
  todayClearCount: number;
  currentStreak: number;
  pendingPoints: number;
  redeeming: boolean;
  onRedeem: () => void;
}) {
  const ready = pendingPoints >= REDEEM_THRESHOLD;
  const progress = Math.min(pendingPoints, REDEEM_THRESHOLD);
  const already = new Set(claimedTypes);

  interface Row {
    done: boolean;
    label: string;
    progress?: string;
  }
  const rows: Row[] = [
    {
      done: already.has("daily_1"),
      label: "오늘 첫 클리어 (+1~5원)",
    },
    {
      done: already.has("daily_3"),
      label: "오늘 3판 클리어 (+2원)",
      progress: `${Math.min(todayClearCount, 3)}/3`,
    },
    {
      done: already.has("daily_5"),
      label: "오늘 5판 클리어 (+3원)",
      progress: `${Math.min(todayClearCount, 5)}/5`,
    },
    {
      done: already.has("combo_10"),
      label: "10연속 정답 (+1원)",
    },
    {
      done: already.has("streak_3"),
      label: "3일 연속 출석 (+2원)",
      progress: `${Math.min(currentStreak, 3)}/3`,
    },
    {
      done: already.has("streak_7"),
      label: "7일 연속 출석 (+5원)",
      progress: `${Math.min(currentStreak, 7)}/7`,
    },
    {
      done: already.has("streak_30"),
      label: "30일 연속 출석 (+10원)",
      progress: `${Math.min(currentStreak, 30)}/30`,
    },
  ];

  return (
    <div
      style={{
        background: ready ? "#FFF8E1" : "#FFFFFF",
        border: ready ? "1.5px solid #FFB300" : "1.5px solid #FFE0B2",
        borderRadius: 16,
        padding: "14px 16px",
        marginBottom: 14,
        boxShadow: ready
          ? "0 2px 16px rgba(255, 179, 0, 0.32)"
          : "0 1px 6px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 8,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: "#5D4037" }}>
          🎯 오늘의 미션
          {currentStreak > 0 ? ` · 🔥 ${currentStreak}일 연속` : ""}
        </div>
        <div style={{ fontSize: 12, color: "#8D6E63", fontWeight: 600 }}>
          누적 {progress} / {REDEEM_THRESHOLD}원
        </div>
      </div>
      {ready ? (
        <div
          style={{
            fontSize: 13,
            color: "#E65100",
            fontWeight: 700,
            marginBottom: 10,
            lineHeight: 1.55,
          }}
        >
          💎 {pendingPoints}원 모였어요! 광고 보고 토스 포인트로 받을 수 있어요
        </div>
      ) : (
        <div style={{ marginBottom: 10 }}>
          {rows.map((r, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 12,
                color: r.done ? "#9E9E9E" : "#5D4037",
                fontWeight: r.done ? 500 : 600,
                padding: "3px 0",
                textDecoration: r.done ? "line-through" : "none",
              }}
            >
              <span>
                {r.done ? "✓" : "☐"} {r.label}
              </span>
              {r.progress ? (
                <span style={{ fontSize: 11, color: "#8D6E63" }}>
                  {r.progress}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      )}
      <div
        style={{
          height: 6,
          background: "#FFF3E0",
          borderRadius: 999,
          overflow: "hidden",
          marginBottom: ready ? 12 : 0,
        }}
      >
        <div
          style={{
            width: `${(progress / REDEEM_THRESHOLD) * 100}%`,
            height: "100%",
            background: "linear-gradient(90deg, #FFB300 0%, #FF8F00 100%)",
            transition: "width 240ms ease",
          }}
        />
      </div>
      {ready ? (
        <button
          type="button"
          onClick={onRedeem}
          disabled={redeeming}
          style={{
            width: "100%",
            padding: "12px",
            border: "none",
            borderRadius: 10,
            background: "linear-gradient(135deg, #FFB300 0%, #FF8F00 100%)",
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: 800,
            cursor: redeeming ? "wait" : "pointer",
            opacity: redeeming ? 0.7 : 1,
          }}
        >
          {redeeming
            ? "광고 준비 중..."
            : `📺 광고 보고 토스 포인트로 받기 (${pendingPoints}원)`}
        </button>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "#F5F5F5",
        borderRadius: 14,
        padding: "14px 12px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 11, color: "#9E9E9E", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#212121" }}>
        {value}
      </div>
    </div>
  );
}
