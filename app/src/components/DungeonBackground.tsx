import { motion } from "framer-motion";
import { ERA_THEME } from "../data/bosses";
import type { Era } from "../types";

interface Props {
  era: Era;
  children: React.ReactNode;
  shakeKey?: number;
  flashKey?: number;
}

export function DungeonBackground({ era, children, shakeKey = 0, flashKey = 0 }: Props) {
  const theme = ERA_THEME[era];

  return (
    <motion.div
      animate={{
        x: shakeKey ? [0, -10, 10, -8, 8, -4, 4, 0] : 0,
      }}
      transition={{ duration: 0.5 }}
      style={{
        minHeight: "100vh",
        position: "relative",
        background: theme.bgGradient,
        color: "#FFFFFF",
        overflow: "hidden",
      }}
    >
      {/* 천장 횃불 */}
      <Torch side="left" color={theme.accent} />
      <Torch side="right" color={theme.accent} />

      {/* 바닥 그림자 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.6) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

      {/* 돌벽 텍스처 (반복 패턴) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.07,
          backgroundImage:
            "repeating-linear-gradient(45deg, #FFFFFF 0 2px, transparent 2px 20px), repeating-linear-gradient(-45deg, #FFFFFF 0 2px, transparent 2px 20px)",
          pointerEvents: "none",
        }}
      />

      {/* 피격 플래시 */}
      {flashKey ? (
        <motion.div
          key={flashKey}
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(229, 57, 53, 0.5)",
            pointerEvents: "none",
            zIndex: 5,
          }}
        />
      ) : null}

      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </motion.div>
  );
}

function Torch({ side, color }: { side: "left" | "right"; color: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 80,
        [side]: 16,
        width: 6,
        height: 70,
        background: "linear-gradient(to bottom, #5D4037, #3E2723)",
        borderRadius: 2,
      }}
    >
      <motion.div
        animate={{
          scaleY: [1, 1.15, 0.9, 1.1, 1],
          opacity: [0.9, 1, 0.85, 1, 0.9],
        }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: -22,
          left: "50%",
          transform: "translateX(-50%)",
          width: 20,
          height: 28,
          background: `radial-gradient(ellipse at center, ${color} 0%, #FF6F00 40%, transparent 70%)`,
          borderRadius: "50% 50% 45% 45% / 60% 60% 40% 40%",
          filter: "blur(1px)",
          transformOrigin: "bottom center",
        }}
      />
      {/* 빛 번짐 */}
      <motion.div
        animate={{ opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: -50,
          left: "50%",
          transform: "translateX(-50%)",
          width: 80,
          height: 80,
          background: `radial-gradient(circle, ${color}55 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
