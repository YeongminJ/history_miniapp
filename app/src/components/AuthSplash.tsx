import { motion } from "framer-motion";

export function AuthSplash() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background:
          "radial-gradient(ellipse at 30% 20%, #8D6E63 0%, transparent 55%), linear-gradient(180deg, #5D4037 0%, #3E2723 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        color: "#FFFFFF",
        textAlign: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          fontFamily:
            '"Nanum Myeongjo", "AppleMyungjo", "Apple SD Gothic Neo", "Noto Serif KR", serif',
          fontSize: 56,
          fontWeight: 900,
          background:
            "linear-gradient(180deg, #FFF8E1 0%, #FFC107 55%, #FF8F00 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          textShadow: "0 6px 20px rgba(0,0,0,0.55)",
          marginBottom: 12,
        }}
      >
        역사왕
      </motion.div>
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          fontSize: 13,
          letterSpacing: 4,
          color: "#FFD54F",
          fontWeight: 700,
        }}
      >
        토스로 시작하기
      </motion.div>
    </div>
  );
}
