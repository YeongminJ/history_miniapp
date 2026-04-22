import { AnimatePresence, motion } from "framer-motion";

interface Props {
  show: boolean;
  value: number;
  kind: "damage" | "hp-loss" | "miss";
  critical?: boolean;
  stamp: number;
}

export function FloatingDamage({ show, value, kind, critical, stamp }: Props) {
  const color =
    kind === "damage"
      ? critical
        ? "#FFEB3B"
        : "#FF5252"
      : kind === "hp-loss"
        ? "#64B5F6"
        : "#BDBDBD";
  const prefix = kind === "damage" ? "-" : kind === "hp-loss" ? "-" : "";
  const suffix = kind === "hp-loss" ? " HP" : "";
  const label = kind === "miss" ? "MISS" : `${prefix}${value}${suffix}`;

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key={stamp}
          initial={{ opacity: 0, y: 20, scale: 0.6 }}
          animate={{ opacity: 1, y: -60, scale: critical ? 1.5 : 1.2 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: critical ? 40 : 32,
            fontWeight: 900,
            color,
            textShadow: "0 2px 6px rgba(0,0,0,0.8), 0 0 12px currentColor",
            pointerEvents: "none",
            zIndex: 10,
            letterSpacing: 1,
          }}
        >
          {critical ? "CRITICAL! " : ""}
          {label}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
