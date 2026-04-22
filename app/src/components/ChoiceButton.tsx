import { motion } from "framer-motion";

type State = "idle" | "correct" | "wrong" | "dimmed";

interface Props {
  index: number;
  label: string;
  state: State;
  disabled: boolean;
  onClick: () => void;
  accent: string;
}

const INDEX_LABEL = ["①", "②", "③", "④"] as const;

export function ChoiceButton({
  index,
  label,
  state,
  disabled,
  onClick,
  accent,
}: Props) {
  const styles = getStyles(state, accent);
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      animate={
        state === "correct"
          ? { scale: [1, 1.05, 1] }
          : state === "wrong"
            ? { x: [0, -6, 6, -4, 4, 0] }
            : {}
      }
      transition={{ duration: 0.35 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        textAlign: "left",
        padding: "14px 16px",
        borderRadius: 12,
        background: styles.bg,
        border: `1.5px solid ${styles.border}`,
        color: styles.color,
        fontSize: 15,
        fontWeight: 700,
        cursor: disabled ? "default" : "pointer",
        appearance: "none",
        boxShadow: styles.shadow,
        backdropFilter: "blur(4px)",
        transition: "background 0.2s, border 0.2s, color 0.2s",
      }}
    >
      <span style={{ fontSize: 18, opacity: 0.9, color: styles.numColor }}>
        {INDEX_LABEL[index]}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
    </motion.button>
  );
}

function getStyles(state: State, accent: string) {
  switch (state) {
    case "idle":
      return {
        bg: "rgba(255,255,255,0.08)",
        border: "rgba(255,255,255,0.2)",
        color: "#FFFFFF",
        numColor: accent,
        shadow: "0 2px 8px rgba(0,0,0,0.2)",
      };
    case "correct":
      return {
        bg: "rgba(76, 175, 80, 0.25)",
        border: "#81C784",
        color: "#E8F5E9",
        numColor: "#A5D6A7",
        shadow: "0 0 20px rgba(76, 175, 80, 0.5)",
      };
    case "wrong":
      return {
        bg: "rgba(239, 83, 80, 0.25)",
        border: "#EF5350",
        color: "#FFEBEE",
        numColor: "#FFCDD2",
        shadow: "0 0 20px rgba(239, 83, 80, 0.5)",
      };
    case "dimmed":
      return {
        bg: "rgba(255,255,255,0.03)",
        border: "rgba(255,255,255,0.08)",
        color: "rgba(255,255,255,0.35)",
        numColor: "rgba(255,255,255,0.3)",
        shadow: "none",
      };
  }
}
