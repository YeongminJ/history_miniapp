import { motion } from "framer-motion";

interface Props {
  current: number;
  max: number;
  label: string;
  activeColor: string;
  emptyColor?: string;
  textColor?: string;
}

export function SegmentedHPBar({
  current,
  max,
  label,
  activeColor,
  emptyColor = "rgba(255,255,255,0.12)",
  textColor = "#FFFFFF",
}: Props) {
  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: textColor,
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
      <div style={{ display: "flex", gap: 3 }}>
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < current;
          return (
            <motion.div
              key={i}
              animate={{
                background: filled ? activeColor : emptyColor,
                boxShadow: filled ? `0 0 6px ${activeColor}88` : "none",
              }}
              transition={{ duration: 0.25 }}
              style={{
                flex: 1,
                height: 10,
                borderRadius: 2,
                border: `1px solid ${filled ? activeColor : "rgba(255,255,255,0.2)"}`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
