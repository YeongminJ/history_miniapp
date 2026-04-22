import { motion } from "framer-motion";
import { ERA_BOSS_EMOJI, ERA_THEME } from "../data/bosses";
import type { Era } from "../types";

interface Props {
  era: Era;
  name: string;
  hitKey?: number;
  missKey?: number;
  critical?: boolean;
}

export function EnemyPortrait({
  era,
  name,
  hitKey = 0,
  missKey = 0,
  critical = false,
}: Props) {
  const theme = ERA_THEME[era];
  const emoji = ERA_BOSS_EMOJI[era];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      {/* 이름 배너 */}
      <div
        style={{
          position: "relative",
          padding: "6px 18px",
          background: theme.nameBg,
          border: `1.5px solid ${theme.frameBorder}`,
          borderRadius: 20,
          color: theme.accent,
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: 1,
          boxShadow: `0 0 14px ${theme.frameGlow}`,
        }}
      >
        ✦ {name} ✦
      </div>

      {/* 초상 프레임 */}
      <motion.div
        key={`${hitKey}-${missKey}`}
        animate={{
          y: missKey ? [0, -4, 2, -3, 0] : 0,
          x: missKey ? [0, -10, 10, -6, 6, 0] : 0,
          scale: hitKey ? [1, 0.88, 1.06, 1] : 1,
          rotate: hitKey ? [0, -8, 8, 0] : 0,
        }}
        transition={{ duration: 0.5 }}
        style={{
          position: "relative",
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: `radial-gradient(circle at 30% 30%, ${theme.nameBg} 0%, #000 90%)`,
          border: `3px solid ${theme.frameBorder}`,
          boxShadow: `0 0 30px ${theme.frameGlow}, inset 0 0 20px rgba(0,0,0,0.6)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* 아이들 호흡 */}
        <motion.div
          animate={{ scale: [1, 1.04, 1], y: [0, -2, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ fontSize: 80, lineHeight: 1 }}
        >
          {emoji}
        </motion.div>
        {/* 크리티컬 후광 */}
        {critical ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 1, 0], scale: [0.6, 1.4, 1.6] }}
            transition={{ duration: 0.8 }}
            style={{
              position: "absolute",
              inset: -10,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,255,0,0.7) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
        ) : null}
      </motion.div>
    </div>
  );
}
