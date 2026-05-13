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
              ⚠ HP 0
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              여기서 끝낼 거예요?
            </div>
            <div
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.78)",
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              {adSupported ? (
                <>
                  광고 1개만 보면 HP가 회복돼요.
                  <br />
                  <span style={{ color: theme.accent, fontWeight: 700 }}>
                    이 챕터 클리어까지 한 번 더 기회!
                  </span>
                </>
              ) : (
                "지금은 광고 이어하기를 사용할 수 없어요."
              )}
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
                  ? "▶ 광고 1개 보고 부활하기"
                  : adLoading
                    ? "광고 준비 중... (눌러도 준비되면 자동 재생)"
                    : "광고 사용 불가"}
            </button>

            <button
              type="button"
              onClick={onGiveUp}
              style={{
                width: "100%",
                marginTop: 10,
                padding: "10px",
                background: "transparent",
                color: "rgba(255,255,255,0.45)",
                border: "none",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              그만 둘게요
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
