import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  period?: string;
  accent: string;
}

export function SpeechBubble({ children, period, accent }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35 }}
      style={{
        position: "relative",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(240,240,245,0.97) 100%)",
        border: `2px solid ${accent}`,
        borderRadius: 18,
        padding: "18px 20px",
        boxShadow: `0 8px 24px rgba(0,0,0,0.45), 0 0 16px ${accent}33`,
        marginTop: 20,
        color: "#212121",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -12,
          left: "50%",
          transform: "translateX(-50%) rotate(45deg)",
          width: 18,
          height: 18,
          background: "#FFFFFF",
          borderLeft: `2px solid ${accent}`,
          borderTop: `2px solid ${accent}`,
        }}
      />
      {period ? (
        <div
          style={{
            fontSize: 11,
            color: "#757575",
            fontWeight: 700,
            marginBottom: 6,
            letterSpacing: 1,
          }}
        >
          📜 {period}
        </div>
      ) : null}
      <div
        style={{
          fontSize: 16,
          lineHeight: 1.55,
          color: "#212121",
          fontWeight: 700,
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}
