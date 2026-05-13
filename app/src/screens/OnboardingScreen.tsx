import { Button } from "@toss/tds-mobile";
import { motion } from "framer-motion";
import { useState } from "react";
import { isPromotionEnabled } from "../lib/promotion";
import { trackClick, trackScreen } from "../lib/track";
import { useEffect } from "react";
import { useOnboardingStore } from "../store/useOnboardingStore";
import { useReminderStore } from "../store/useReminderStore";

export function OnboardingScreen() {
  const completeOnboarding = useOnboardingStore((s) => s.complete);
  const setEnabled = useReminderStore((s) => s.setEnabled);
  const setTime = useReminderStore((s) => s.setTime);

  const [optIn, setOptIn] = useState(false); // 디폴트 OFF — 토스 OAuth 부담 없이 빠르게 진입
  const [hour, setHour] = useState(21);
  const [minute, setMinute] = useState(0);
  const [busy, setBusy] = useState(false);
  const promotionOn = isPromotionEnabled();

  useEffect(() => {
    trackScreen("screen_onboarding");
  }, []);

  const onChangeTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, m] = e.target.value.split(":").map((s) => parseInt(s, 10));
    if (Number.isFinite(h) && Number.isFinite(m)) {
      setHour(h);
      setMinute(m);
    }
  };

  const handleStart = async () => {
    if (busy) return;
    setBusy(true);
    trackClick("press_onboarding_start", {
      reminder_opt_in: optIn,
      hour,
      minute,
    });
    try {
      if (optIn) {
        await setTime(hour, minute);
        await setEnabled(true);
      }
    } finally {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    trackClick("press_onboarding_skip");
    completeOnboarding();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at 30% 18%, #8D6E63 0%, transparent 50%), linear-gradient(180deg, #5D4037 0%, #3E2723 100%)",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        padding: "60px 24px 28px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ flex: 1, display: "flex", flexDirection: "column" }}
      >
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              fontFamily:
                '"Nanum Myeongjo", "AppleMyungjo", "Apple SD Gothic Neo", "Noto Serif KR", serif',
              fontSize: 56,
              fontWeight: 900,
              background:
                "linear-gradient(180deg, #FFF8E1 0%, #FFC107 55%, #FF8F00 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              textShadow: "0 6px 20px rgba(0,0,0,0.5)",
              lineHeight: 1.05,
              marginBottom: 10,
            }}
          >
            역사왕에
            <br />
            오신 걸
            <br />
            환영해요
          </div>
          <div
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.78)",
              lineHeight: 1.55,
              marginTop: 8,
            }}
          >
            매일 한 문제씩 풀면 한국사가 쉬워져요.
            {promotionOn ? (
              <>
                <br />
                던전 클리어할 때마다 토스 포인트 1~5원 적립!
              </>
            ) : null}
          </div>
        </div>

        <section
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1.5px solid rgba(255,255,255,0.15)",
            borderRadius: 16,
            padding: 18,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{ fontSize: 16, fontWeight: 800, color: "#FFFFFF" }}
              >
                📚 학습 알림
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.65)",
                  marginTop: 4,
                  lineHeight: 1.5,
                }}
              >
                정한 시간에 오늘의 한국사 문제를 보내드려요.
                <br />
                <span style={{ color: "rgba(255,255,255,0.45)" }}>
                  (켜면 토스 로그인이 필요해요)
                </span>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={optIn}
              aria-label="학습 알림 받기"
              onClick={() => setOptIn((v) => !v)}
              style={{
                width: 52,
                height: 30,
                borderRadius: 999,
                border: "none",
                background: optIn ? "#FFC107" : "rgba(255,255,255,0.25)",
                position: "relative",
                cursor: "pointer",
                transition: "background 0.2s",
                flexShrink: 0,
                marginLeft: 12,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: optIn ? 25 : 3,
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  transition: "left 0.2s",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              />
            </button>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0 4px",
              borderTop: "1px solid rgba(255,255,255,0.12)",
              marginTop: 14,
              opacity: optIn ? 1 : 0.45,
            }}
          >
            <span
              style={{ fontSize: 14, color: "#FFFFFF", fontWeight: 600 }}
            >
              알림 시간
            </span>
            <input
              type="time"
              value={`${pad(hour)}:${pad(minute)}`}
              onChange={onChangeTime}
              disabled={!optIn}
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#212121",
                border: "none",
                borderRadius: 8,
                padding: "6px 10px",
                background: "#FFFFFF",
              }}
            />
          </div>

          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.55)",
              marginTop: 10,
              lineHeight: 1.55,
            }}
          >
            언제든지 설정에서 끄거나 시간을 변경할 수 있어요. 알림에는 마케팅
            정보가 포함되지 않아요.
          </div>
        </section>

        <div style={{ flex: 1 }} />

        <Button
          size="xlarge"
          display="full"
          onClick={handleStart}
          loading={busy}
        >
          {optIn ? "알림 받고 시작하기" : "1초만에 시작하기"}
        </Button>
      </motion.div>
    </div>
  );
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}
