import { Button, Top } from "@toss/tds-mobile";
import { useEffect, useMemo } from "react";
import { trackClick, trackScreen } from "../lib/track";
import { useAppStore } from "../store/useAppStore";
import { useAuthStore } from "../store/useAuthStore";
import { useReminderStore } from "../store/useReminderStore";

export function SettingsScreen() {
  const goHome = useAppStore((s) => s.goHome);
  const authStatus = useAuthStore((s) => s.status);
  const authHash = useAuthStore((s) => s.hash);
  const enabled = useReminderStore((s) => s.enabled);
  const hour = useReminderStore((s) => s.hour);
  const minute = useReminderStore((s) => s.minute);
  const syncStatus = useReminderStore((s) => s.syncStatus);
  const syncMessage = useReminderStore((s) => s.syncMessage);
  const setEnabled = useReminderStore((s) => s.setEnabled);
  const setTime = useReminderStore((s) => s.setTime);

  useEffect(() => {
    trackScreen("screen_settings");
  }, []);

  const timeValue = useMemo(
    () => `${pad(hour)}:${pad(minute)}`,
    [hour, minute],
  );

  const onToggle = async () => {
    const next = !enabled;
    trackClick("press_reminder_toggle", { enabled: next, hour, minute });
    await setEnabled(next);
  };

  const onChangeTime = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, m] = e.target.value.split(":").map((s) => parseInt(s, 10));
    if (Number.isFinite(h) && Number.isFinite(m)) {
      trackClick("press_reminder_time", { hour: h, minute: m });
      await setTime(h, m);
    }
  };

  const supported = authStatus !== "unsupported" && authStatus !== "invalid_category";
  const ready = supported && !!authHash;

  const statusLine = (() => {
    if (!supported) return "지원하지 않는 환경이에요. 토스앱에서 이용해 주세요.";
    if (!authHash) return "잠시 후 다시 시도해 주세요.";
    if (syncStatus === "syncing") return "저장 중…";
    if (syncStatus === "no_endpoint") return "알림 서버 연결 준비 중이에요.";
    if (syncStatus === "auth_required")
      return "푸시를 받으려면 토스 로그인이 필요해요. 다시 켜서 로그인해 주세요.";
    if (syncStatus === "error")
      return `오류가 발생했어요${syncMessage ? ` (${syncMessage})` : ""}`;
    if (syncStatus === "ok" && enabled)
      return `매일 ${pad(hour)}:${pad(minute)}에 보내드릴게요.`;
    if (syncStatus === "ok" && !enabled) return "알림이 꺼져 있어요.";
    return enabled
      ? `매일 ${pad(hour)}:${pad(minute)}에 보내드려요.`
      : "알림을 받으려면 켜 주세요.";
  })();

  return (
    <div style={{ paddingBottom: 60 }}>
      <Top
        title={<Top.TitleParagraph size={22}>설정</Top.TitleParagraph>}
        subtitleBottom={
          <Top.SubtitleParagraph size={15}>
            학습 알림을 받을 시간을 설정해 보세요
          </Top.SubtitleParagraph>
        }
      />

      <div style={{ padding: "8px 20px 20px" }}>
        <section
          style={{
            background: "#FFFFFF",
            border: "1.5px solid #F0F0F0",
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
              marginBottom: 10,
            }}
          >
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#212121" }}>
                📚 학습 알림
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#757575",
                  marginTop: 4,
                  lineHeight: 1.5,
                }}
              >
                직접 정한 시간에 오늘의 한국사 문제를 보내드려요.
                <br />
                언제든지 끌 수 있어요.
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              aria-label="학습 알림"
              onClick={onToggle}
              disabled={!ready || syncStatus === "syncing"}
              style={{
                width: 52,
                height: 30,
                borderRadius: 999,
                border: "none",
                background: enabled ? "#5D4037" : "#E0E0E0",
                position: "relative",
                cursor: ready ? "pointer" : "not-allowed",
                transition: "background 0.2s",
                opacity: ready ? 1 : 0.5,
                flexShrink: 0,
                marginLeft: 12,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: enabled ? 25 : 3,
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  transition: "left 0.2s",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }}
              />
            </button>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 0",
              borderTop: "1px solid #F5F5F5",
              marginTop: 10,
              opacity: enabled && ready ? 1 : 0.5,
            }}
          >
            <span style={{ fontSize: 14, color: "#424242", fontWeight: 600 }}>
              알림 시간
            </span>
            <input
              type="time"
              value={timeValue}
              onChange={onChangeTime}
              disabled={!enabled || !ready}
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#212121",
                border: "1px solid #E0E0E0",
                borderRadius: 8,
                padding: "6px 10px",
                background: "#FFFFFF",
              }}
            />
          </label>

          <div
            style={{
              fontSize: 12,
              color: enabled ? "#5D4037" : "#9E9E9E",
              marginTop: 8,
              fontWeight: 600,
            }}
          >
            {statusLine}
          </div>
        </section>

        <section
          style={{
            background: "#FAFAFA",
            borderRadius: 12,
            padding: 14,
            fontSize: 12,
            color: "#616161",
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4, color: "#424242" }}>
            안내
          </div>
          이 알림은 사용자가 직접 켜고 시간을 정한 경우에만 발송돼요. 마케팅
          정보는 포함되지 않으며, 언제든 끄거나 시간을 바꿀 수 있어요.
        </section>

        <Button
          size="large"
          display="full"
          variant="weak"
          color="dark"
          onClick={() => {
            trackClick("press_back_from_settings");
            goHome();
          }}
        >
          홈으로
        </Button>
      </div>
    </div>
  );
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}
