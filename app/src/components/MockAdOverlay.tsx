import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
  visible: boolean;
  durationMs: number;
}

/**
 * Dev/browser 환경에서 실제 광고 대신 표시되는 모의 오버레이.
 * 카운트다운이 끝나면 hook이 보상을 자동으로 지급해요.
 */
export function MockAdOverlay({ visible, durationMs }: Props) {
  const [remaining, setRemaining] = useState(durationMs);

  useEffect(() => {
    if (!visible) {
      setRemaining(durationMs);
      return;
    }
    const start = performance.now();
    let rafId = 0;
    const tick = (now: number) => {
      const next = Math.max(0, durationMs - (now - start));
      setRemaining(next);
      if (next > 0) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [visible, durationMs]);

  const seconds = Math.ceil(remaining / 1000);
  const pct = Math.max(0, Math.min(100, 100 - (remaining / durationMs) * 100));

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="mock-ad"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed",
            inset: 0,
            background: "#000",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            zIndex: 100,
            padding: 24,
          }}
        >
          {/* 가짜 광고 카드 */}
          <div
            style={{
              width: "100%",
              maxWidth: 340,
              aspectRatio: "1 / 1.2",
              borderRadius: 16,
              background:
                "linear-gradient(135deg, #1976D2 0%, #0D47A1 50%, #5D4037 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                padding: "4px 10px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.15)",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 2,
              }}
            >
              AD · 테스트 광고
            </div>
            <div style={{ fontSize: 72, marginBottom: 16 }}>🎬</div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              광고 재생 중
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.75)",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              실제 앱인토스 환경에서는 토스 애즈 /<br />
              AdMob 보상형 광고가 표시됩니다.
            </div>
          </div>

          <div
            style={{
              width: "100%",
              maxWidth: 340,
              marginTop: 20,
              background: "rgba(255,255,255,0.1)",
              borderRadius: 999,
              height: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: "#FFC107",
                transition: "width 80ms linear",
              }}
            />
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 13,
              color: "rgba(255,255,255,0.8)",
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            {seconds}초 후 보상이 지급됩니다
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
