import { AnimatePresence, motion } from "framer-motion";
import type { Era } from "../types";
import { ERA_THEME } from "../data/bosses";

interface Props {
  visible: boolean;
  era: Era;
  adReady: boolean;
  adLoading?: boolean;
  adSupported: boolean;
  adIsTest?: boolean;
  onWatchAd: () => void;
  onGiveUp: () => void;
}

export function ReviveOverlay({
  visible,
  era,
  adReady,
  adLoading,
  adSupported,
  adIsTest,
  onWatchAd,
  onGiveUp,
}: Props) {
  const theme = ERA_THEME[era];
  // 로딩 중이어도 버튼 활성화해서 대기 후 자동 재생되게 함
  const canWatch = adSupported && (adReady || adLoading);
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="revive"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.82)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 25,
            padding: "0 24px",
          }}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            style={{
              width: "100%",
              maxWidth: 420,
              background: "#1A1A1A",
              border: `2px solid ${theme.accent}`,
              borderRadius: 20,
              padding: "28px 24px",
              textAlign: "center",
              color: "#FFFFFF",
              boxShadow: `0 0 40px ${theme.frameGlow}`,
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: theme.accent,
                fontWeight: 800,
                letterSpacing: 3,
                marginBottom: 10,
              }}
            >
              ⚠ HP 소진
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 900,
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              전투 이어하기
            </div>
            <div
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.75)",
                lineHeight: 1.55,
                marginBottom: 24,
              }}
            >
              {adSupported
                ? "광고를 보면 HP 1을 회복하고\n이 챕터를 계속 이어갈 수 있어요."
                : "지금은 광고 이어하기를 사용할 수 없어요."}
            </div>

            <button
              type="button"
              disabled={!canWatch}
              onClick={onWatchAd}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: 0.5,
                background: !canWatch
                  ? "rgba(255,255,255,0.08)"
                  : adReady
                    ? theme.accent
                    : "rgba(255,255,255,0.15)",
                color: canWatch && adReady ? "#000" : "#FFFFFF",
                border: "none",
                cursor: canWatch ? "pointer" : "not-allowed",
                boxShadow: adReady ? `0 0 22px ${theme.frameGlow}` : "none",
                transition: "background 0.2s",
              }}
            >
              {!adSupported
                ? "광고 기능 미지원"
                : adReady
                  ? "▶ 광고 보고 이어하기"
                  : adLoading
                    ? "광고 준비 중... (눌러도 준비 완료 후 재생)"
                    : "광고 사용 불가"}
            </button>

            <button
              type="button"
              onClick={onGiveUp}
              style={{
                width: "100%",
                marginTop: 12,
                padding: "14px",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
                background: "transparent",
                color: "rgba(255,255,255,0.7)",
                border: "1.5px solid rgba(255,255,255,0.2)",
                cursor: "pointer",
              }}
            >
              포기하고 결과 보기
            </button>

            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.4)",
                marginTop: 14,
                letterSpacing: 0.3,
              }}
            >
              챕터당 1회 사용 가능
              {adIsTest ? " · 테스트 광고 ID" : ""}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
