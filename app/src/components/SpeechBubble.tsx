import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  period?: string;
}

export function SpeechBubble({ children, period }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "relative",
        background: "#FFFFFF",
        border: "1.5px solid #E0E0E0",
        borderRadius: 16,
        padding: "16px 18px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        marginTop: 18,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -10,
          left: "50%",
          transform: "translateX(-50%) rotate(45deg)",
          width: 16,
          height: 16,
          background: "#FFFFFF",
          borderLeft: "1.5px solid #E0E0E0",
          borderTop: "1.5px solid #E0E0E0",
        }}
      />
      {period ? (
        <div
          style={{
            fontSize: 11,
            color: "#9E9E9E",
            fontWeight: 600,
            marginBottom: 6,
            letterSpacing: 0.4,
          }}
        >
          {period}
        </div>
      ) : null}
      <div
        style={{
          fontSize: 16,
          lineHeight: 1.55,
          color: "#212121",
          fontWeight: 600,
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}
