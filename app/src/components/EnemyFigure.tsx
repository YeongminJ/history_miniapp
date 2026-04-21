import { motion } from "framer-motion";
import type { Era } from "../types";

interface Props {
  era: Era | null;
  hitKey?: number;
  missKey?: number;
}

const EMOJI: Record<Era, string> = {
  고대: "🗿",
  고려: "🏯",
  조선: "👑",
  근대: "⚔️",
  현대: "🎌",
};

export function EnemyFigure({ era, hitKey = 0, missKey = 0 }: Props) {
  if (!era) return null;
  return (
    <motion.div
      key={`${hitKey}-${missKey}`}
      animate={{
        x: missKey ? [0, -10, 10, -6, 6, 0] : 0,
        scale: hitKey ? [1, 0.85, 1.05, 1] : 1,
        rotate: hitKey ? [0, -6, 6, 0] : 0,
      }}
      transition={{ duration: 0.45 }}
      style={{
        fontSize: 96,
        lineHeight: 1,
        filter:
          missKey > hitKey ? "drop-shadow(0 0 12px #E53935)" : "none",
      }}
    >
      {EMOJI[era]}
    </motion.div>
  );
}
