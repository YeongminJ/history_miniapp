import { AnimatePresence, motion } from "framer-motion";

interface Props {
  current: number;
  max: number;
  label?: string;
}

/**
 * 플레이어 HP 전용: 하트 아이콘으로 HP를 표시.
 * 감소 시 깨진 하트로 바뀌며 페이드아웃.
 */
export function HeartHPBar({ current, max, label = "내 HP" }: Props) {
  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "#FFFFFF",
          opacity: 0.85,
          fontWeight: 700,
          letterSpacing: 1,
          marginBottom: 4,
        }}
      >
        <span>{label}</span>
        <span>
          {current} / {max}
        </span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < current;
          return (
            <div
              key={i}
              style={{
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <AnimatePresence initial={false}>
                {filled ? (
                  <motion.span
                    key="full"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0, rotate: -30 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    style={{
                      fontSize: 24,
                      filter:
                        "drop-shadow(0 0 8px rgba(239,83,80,0.8)) drop-shadow(0 2px 2px rgba(0,0,0,0.5))",
                    }}
                  >
                    ❤️
                  </motion.span>
                ) : (
                  <motion.span
                    key="empty"
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.45 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      fontSize: 22,
                      filter: "grayscale(100%) brightness(0.55)",
                    }}
                  >
                    🖤
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
