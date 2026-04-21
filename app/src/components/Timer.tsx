import { useEffect, useRef, useState } from "react";

interface Props {
  durationMs: number;
  running: boolean;
  onExpire: () => void;
  resetKey?: string | number;
}

export function Timer({ durationMs, running, onExpire, resetKey }: Props) {
  const [remaining, setRemaining] = useState(durationMs);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setRemaining(durationMs);
    startRef.current = null;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
  }, [resetKey, durationMs]);

  useEffect(() => {
    if (!running) return;
    startRef.current = performance.now();
    const initial = remaining;

    const tick = (now: number) => {
      const elapsed = now - (startRef.current ?? now);
      const next = Math.max(0, initial - elapsed);
      setRemaining(next);
      if (next <= 0) {
        onExpire();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, resetKey]);

  const seconds = (remaining / 1000).toFixed(1);
  const pct = Math.max(0, Math.min(100, (remaining / durationMs) * 100));
  const danger = remaining < 3000;

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          color: danger ? "#D32F2F" : "#616161",
          fontWeight: 600,
          marginBottom: 4,
        }}
      >
        <span>⏱ 남은 시간</span>
        <span>{seconds}초</span>
      </div>
      <div
        style={{
          height: 6,
          width: "100%",
          background: "#EEEEEE",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: danger ? "#D32F2F" : "#FFA726",
            transition: "width 80ms linear, background 200ms",
          }}
        />
      </div>
    </div>
  );
}
