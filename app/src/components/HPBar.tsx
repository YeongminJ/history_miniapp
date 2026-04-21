import { motion } from "framer-motion";

interface Props {
  current: number;
  max: number;
  label?: string;
  color?: string;
  small?: boolean;
}

export function HPBar({
  current,
  max,
  label,
  color = "#E53935",
  small = false,
}: Props) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  return (
    <div style={{ width: "100%" }}>
      {label ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: small ? 11 : 13,
            color: "#616161",
            marginBottom: 4,
            fontWeight: 600,
          }}
        >
          <span>{label}</span>
          <span>
            {current} / {max}
          </span>
        </div>
      ) : null}
      <div
        style={{
          width: "100%",
          height: small ? 6 : 10,
          background: "#EEEEEE",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          style={{
            height: "100%",
            background: color,
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}
