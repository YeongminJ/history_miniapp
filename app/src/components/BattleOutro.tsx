import { AnimatePresence, motion } from "framer-motion";

interface Props {
  visible: boolean;
  victory: boolean;
}

export function BattleOutro({ visible, victory }: Props) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="outro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.82)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 30,
          }}
        >
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 14 }}
            style={{
              fontSize: 14,
              color: victory ? "#FFD54F" : "#EF5350",
              fontWeight: 800,
              letterSpacing: 4,
              marginBottom: 8,
            }}
          >
            {victory ? "✦ VICTORY ✦" : "✘ DEFEATED ✘"}
          </motion.div>
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 220,
              damping: 14,
              delay: 0.15,
            }}
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: "#FFFFFF",
              textShadow: victory
                ? "0 0 24px rgba(255,213,79,0.8)"
                : "0 0 24px rgba(239,83,80,0.7)",
              letterSpacing: 2,
            }}
          >
            {victory ? "CHAPTER CLEAR!" : "다시 도전!"}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
