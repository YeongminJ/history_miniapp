import { AnimatePresence, motion } from "framer-motion";

interface Props {
  combo: number;
}

export function ComboBadge({ combo }: Props) {
  return (
    <AnimatePresence>
      {combo >= 2 ? (
        <motion.div
          key={combo}
          initial={{ scale: 0.6, opacity: 0, y: -8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 999,
            background: "linear-gradient(135deg, #FFB300, #FB8C00)",
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 14,
            boxShadow: "0 2px 8px rgba(251, 140, 0, 0.4)",
          }}
        >
          🔥 콤보 ×{combo}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
