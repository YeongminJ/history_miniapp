import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  getCurrentKstMinute,
  hhmmToMinute,
  minuteToHHMM,
} from "../lib/api";

interface Props {
  visible: boolean;
  onRegister: (reminderMinute: number) => void;
  onDismiss: () => void;
}

export function NotificationPromptOverlay({
  visible,
  onRegister,
  onDismiss,
}: Props) {
  const [defaultMinute] = useState(() => getCurrentKstMinute());
  const [hhmm, setHhmm] = useState(() => minuteToHHMM(defaultMinute));
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const minute = hhmmToMinute(hhmm);
      await onRegister(minute);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="noti-prompt"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "0 24px",
          }}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            style={{
              width: "100%",
              maxWidth: 420,
              background: "#FFFFFF",
              borderRadius: 20,
              padding: "28px 24px",
              textAlign: "center",
              boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>👑</div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#212121",
                marginBottom: 6,
              }}
            >
              매일 이 시간에 알림 받을까요?
            </div>
            <div
              style={{
                fontSize: 14,
                color: "#616161",
                lineHeight: 1.5,
                marginBottom: 16,
              }}
            >
              한 문제씩 꾸준히 풀어
              <br />
              연속 출석을 이어가세요.
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#9E9E9E",
                marginBottom: 16,
              }}
            >
              등록 시 토스 로그인이 필요해요
            </div>

            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "#9E9E9E",
                fontWeight: 600,
                marginBottom: 6,
                textAlign: "left",
              }}
            >
              알림 시간
            </label>
            <input
              type="time"
              value={hhmm}
              onChange={(e) => setHhmm(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                fontSize: 18,
                fontWeight: 700,
                color: "#212121",
                background: "#F5F5F5",
                border: "1.5px solid transparent",
                borderRadius: 12,
                marginBottom: 20,
                fontFamily: "inherit",
              }}
            />

            <button
              type="button"
              disabled={submitting}
              onClick={handleRegister}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 800,
                background: "#5D4037",
                color: "#FFFFFF",
                border: "none",
                cursor: submitting ? "wait" : "pointer",
                opacity: submitting ? 0.7 : 1,
                marginBottom: 8,
              }}
            >
              {submitting ? "등록 중..." : "등록하고 계속 도전!"}
            </button>
            <button
              type="button"
              onClick={onDismiss}
              disabled={submitting}
              style={{
                width: "100%",
                padding: "12px",
                background: "transparent",
                color: "#9E9E9E",
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: submitting ? "wait" : "pointer",
              }}
            >
              다음에
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
