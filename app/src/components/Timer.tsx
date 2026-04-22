import { useEffect, useRef, useState } from "react";

interface Props {
  durationMs: number;
  running: boolean;
  onExpire: () => void;
  resetKey?: string | number;
}

export function Timer({ durationMs, running, onExpire, resetKey }: Props) {
  const [remaining, setRemaining] = useState(durationMs);
  const rafRef = useRef<number | null>(null);
  const onExpireRef = useRef(onExpire);

  // 최신 onExpire 참조 유지 (콜백 갱신이 effect 재시작을 일으키지 않도록)
  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  // 문제 전환마다 남은 시간을 durationMs로 초기화
  useEffect(() => {
    setRemaining(durationMs);
  }, [resetKey, durationMs]);

  useEffect(() => {
    if (!running) return;

    const start = performance.now();
    let expired = false;

    const tick = (now: number) => {
      const elapsed = now - start;
      const next = Math.max(0, durationMs - elapsed);
      setRemaining(next);
      if (next <= 0) {
        if (!expired) {
          expired = true;
          onExpireRef.current();
        }
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [running, resetKey, durationMs]);

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
          color: danger ? "#EF5350" : "rgba(255,255,255,0.8)",
          fontWeight: 700,
          marginBottom: 4,
          letterSpacing: 0.5,
        }}
      >
        <span>⏱ 남은 시간</span>
        <span>{seconds}초</span>
      </div>
      <div
        style={{
          height: 6,
          width: "100%",
          background: "rgba(255,255,255,0.12)",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: danger ? "#EF5350" : "#FFB74D",
            transition: "width 80ms linear, background 200ms",
          }}
        />
      </div>
    </div>
  );
}
