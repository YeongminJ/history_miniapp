import { AnimatePresence, motion } from "framer-motion";
import { PLAYER_X } from "../store/useRunnerStore";
import {
  PlayerByStyle,
  TigerByStyle,
  type CharacterStyle,
} from "./RunnerCharacters";

interface Props {
  chaserX: number;
  combo: number;
  characterStyle: CharacterStyle;
  /** 최근 답 정·오 (애니메이션 트리거) */
  lastCorrect: boolean | null;
  /** 최근 이벤트 stamp — 새 답마다 증가 */
  lastEventStamp: number;
  lastGain: number;
}

/**
 * 무한 추격 모드의 시각 무대.
 *
 * - 배경: 3-layer parallax (콤보로 가속)
 * - 플레이어/호랑이: 항상 달리는 연속 애니메이션 (y bob + tilt)
 * - 위치: 플레이어 x 고정 / 호랑이 chaserX 따라 이동
 * - 이벤트: 정답 시 점수 popup + 스파클, 오답 시 캐릭터 흔들림
 */
export function RunnerStage({
  chaserX,
  combo,
  characterStyle,
  lastCorrect,
  lastEventStamp,
  lastGain,
}: Props) {
  // 콤보에 따른 배경 스크롤 가속
  const baseDur = 12;
  const farDur = baseDur - Math.min(7, combo * 0.6);
  const midDur = farDur * 0.55;
  const groundDur = farDur * 0.3;

  // 호랑이 근접 시 위험 그라디언트
  const danger = Math.min(1, Math.max(0, (chaserX - 30) / (PLAYER_X - 30)));

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: 240,
        overflow: "hidden",
        borderRadius: 16,
        background: "linear-gradient(180deg, #1A237E 0%, #311B92 60%, #4A148C 100%)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.3) inset",
      }}
    >
      {/* 위험 오버레이 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 0% 50%, rgba(229,57,53,${danger * 0.55}) 0%, transparent 60%)`,
          pointerEvents: "none",
          transition: "opacity 0.3s",
        }}
      />

      {/* 원경 */}
      <ScrollLayer durationSec={farDur} y={120} z={0}>
        <MountainStrip color="#1A1438" />
      </ScrollLayer>

      {/* 중경 */}
      <ScrollLayer durationSec={midDur} y={150} z={1}>
        <MountainStrip color="#0F0823" height={60} />
      </ScrollLayer>

      {/* 지면 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 56,
          background: "linear-gradient(180deg, #1B0000 0%, #000 100%)",
          borderTop: "2px solid #4E342E",
        }}
      />
      {/* 지면 디테일 */}
      <ScrollLayer durationSec={groundDur} y={210} z={2}>
        <DashStrip />
      </ScrollLayer>

      {/* 호랑이 — 외곽: 위치 / 내부: 스타일별 캐릭터 */}
      <motion.div
        animate={{ left: `${chaserX}%` }}
        transition={{ type: "tween", duration: 0.35, ease: "easeOut" }}
        style={{
          position: "absolute",
          bottom: 50,
          transform: "translateX(-50%)",
          zIndex: 5,
        }}
      >
        <TigerByStyle style={characterStyle} />
      </motion.div>

      {/* 플레이어 — 외곽: 위치 고정 + 오답 시 흔들림 / 내부: 스타일별 캐릭터 */}
      <motion.div
        key={`player-shake-${lastCorrect === false ? lastEventStamp : "idle"}`}
        initial={false}
        animate={
          lastCorrect === false
            ? { x: [-3, 5, -4, 4, -2, 0], rotate: [-7, 7, -5, 5, -3, 0] }
            : { x: 0, rotate: 0 }
        }
        transition={{ duration: 0.55 }}
        style={{
          position: "absolute",
          left: `${PLAYER_X}%`,
          bottom: 50,
          transform: "translateX(-50%)",
          zIndex: 6,
        }}
      >
        <PlayerByStyle style={characterStyle} />
      </motion.div>

      {/* 정답 점수 popup */}
      <AnimatePresence>
        {lastCorrect && lastGain > 0 ? (
          <motion.div
            key={`gain-${lastEventStamp}`}
            initial={{ opacity: 0, y: 0, scale: 0.7 }}
            animate={{ opacity: 1, y: -28, scale: 1 }}
            exit={{ opacity: 0, y: -42 }}
            transition={{ duration: 0.7 }}
            style={{
              position: "absolute",
              left: `${PLAYER_X}%`,
              bottom: 110,
              transform: "translateX(-50%)",
              color: "#FFEB3B",
              fontSize: 22,
              fontWeight: 900,
              textShadow: "0 0 10px rgba(255,193,7,0.85)",
              pointerEvents: "none",
              zIndex: 7,
            }}
          >
            +{lastGain.toFixed(1)}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* 콤보 3+ 도달 시 스파클 */}
      <AnimatePresence>
        {lastCorrect && combo >= 3 ? (
          <motion.div
            key={`spark-${lastEventStamp}`}
            initial={{ opacity: 0.8, scale: 0.5 }}
            animate={{ opacity: 0, scale: 1.6 }}
            transition={{ duration: 0.6 }}
            style={{
              position: "absolute",
              left: `${PLAYER_X}%`,
              bottom: 80,
              width: 80,
              height: 80,
              transform: "translate(-50%, 50%)",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,235,59,0.8) 0%, transparent 70%)",
              pointerEvents: "none",
              zIndex: 4,
            }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ScrollLayer({
  durationSec,
  y,
  z,
  children,
}: {
  durationSec: number;
  y: number;
  z: number;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: y,
        width: "100%",
        height: 80,
        overflow: "hidden",
        zIndex: z,
      }}
    >
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: durationSec,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          display: "flex",
          width: "200%",
        }}
      >
        <div style={{ width: "50%", flex: "0 0 50%" }}>{children}</div>
        <div style={{ width: "50%", flex: "0 0 50%" }}>{children}</div>
      </motion.div>
    </div>
  );
}

function MountainStrip({
  color,
  height = 80,
}: {
  color: string;
  height?: number;
}) {
  return (
    <svg
      width="100%"
      height={height}
      viewBox="0 0 600 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 80 L60 30 L100 60 L160 20 L220 70 L280 40 L340 65 L400 25 L470 55 L540 35 L600 80 L600 100 L0 100 Z"
        fill={color}
      />
    </svg>
  );
}

function DashStrip() {
  return (
    <svg
      width="100%"
      height="20"
      viewBox="0 0 600 20"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <rect
          key={i}
          x={i * 50 + 5}
          y={6}
          width={30}
          height={4}
          rx={2}
          fill="rgba(255,255,255,0.18)"
        />
      ))}
    </svg>
  );
}
