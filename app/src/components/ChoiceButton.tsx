import { motion } from "framer-motion";

type State = "idle" | "correct" | "wrong" | "dimmed";

interface Props {
  index: number;
  label: string;
  state: State;
  disabled: boolean;
  onClick: () => void;
}

const INDEX_LABEL = ["①", "②", "③", "④"] as const;

const stateStyles: Record<State, { bg: string; border: string; color: string }> =
  {
    idle: { bg: "#FFFFFF", border: "#E0E0E0", color: "#212121" },
    correct: { bg: "#E8F5E9", border: "#43A047", color: "#1B5E20" },
    wrong: { bg: "#FFEBEE", border: "#E53935", color: "#B71C1C" },
    dimmed: { bg: "#FAFAFA", border: "#E0E0E0", color: "#9E9E9E" },
  };

export function ChoiceButton({ index, label, state, disabled, onClick }: Props) {
  const styles = stateStyles[state];
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      animate={
        state === "correct"
          ? { scale: [1, 1.04, 1] }
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
        padding: "16px 18px",
        borderRadius: 14,
        background: styles.bg,
        border: `1.5px solid ${styles.border}`,
        color: styles.color,
        fontSize: 16,
        fontWeight: 600,
        cursor: disabled ? "default" : "pointer",
        appearance: "none",
      }}
    >
      <span style={{ fontSize: 18, opacity: 0.8 }}>{INDEX_LABEL[index]}</span>
      <span style={{ flex: 1 }}>{label}</span>
    </motion.button>
  );
}
