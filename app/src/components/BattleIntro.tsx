import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { ERA_THEME } from "../data/bosses";
import type { Era } from "../types";

interface Props {
  era: Era;
  bossName: string;
  visible: boolean;
  onDone: () => void;
}

export function BattleIntro({ era, bossName, visible, onDone }: Props) {
  const theme = ERA_THEME[era];
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [visible, onDone]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
          }}
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 14 }}
            style={{
              fontSize: 13,
              color: theme.accent,
              fontWeight: 800,
              letterSpacing: 3,
              marginBottom: 12,
            }}
          >
            ⚠ {era} 던전 ⚠
          </motion.div>
          <motion.div
            initial={{ scale: 0.3, opacity: 0, rotate: -15 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 12,
              delay: 0.1,
            }}
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: "#FFFFFF",
              textShadow: `0 0 20px ${theme.frameGlow}`,
              letterSpacing: 2,
            }}
          >
            {bossName}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              fontSize: 16,
              color: "#FFFFFF",
              marginTop: 6,
              opacity: 0.8,
            }}
          >
            (이)가 나타났다!
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
