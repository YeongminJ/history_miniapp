import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  show: boolean;
  stamp: number;
  label: ReactNode;
  color: string;
  critical?: boolean;
  sub?: ReactNode;
}

export function FloatingDamage({
  show,
  stamp,
  label,
  color,
  critical,
  sub,
}: Props) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key={stamp}
          initial={{ opacity: 0, y: 16, scale: 0.6 }}
          animate={{ opacity: 1, y: -64, scale: critical ? 1.45 : 1.15 }}
          exit={{ opacity: 0, y: -96 }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontSize: critical ? 38 : 30,
              fontWeight: 900,
              color,
              textShadow:
                "0 2px 6px rgba(0,0,0,0.85), 0 0 14px currentColor",
              letterSpacing: 1,
              display: "flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </div>
          {sub ? (
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#FFD54F",
                textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                letterSpacing: 1,
              }}
            >
              {sub}
            </div>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
