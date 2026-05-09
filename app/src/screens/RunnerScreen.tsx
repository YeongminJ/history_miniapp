import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { ChaseQuestionCard } from "../components/ChaseQuestionCard";
import {
  CHARACTER_STYLE_META,
  PlayerByStyle,
  TigerByStyle,
  type CharacterStyle,
} from "../components/RunnerCharacters";
import { RunnerStage } from "../components/RunnerStage";
import { useAndroidBack } from "../hooks/useAndroidBack";
import { trackClick, trackScreen } from "../lib/track";
import { useAppStore } from "../store/useAppStore";
import { useRunnerStore } from "../store/useRunnerStore";

export function RunnerScreen() {
  const goHome = useAppStore((s) => s.goHome);
  const status = useRunnerStore((s) => s.status);
  const question = useRunnerStore((s) => s.question);
  const distance = useRunnerStore((s) => s.distance);
  const correctCount = useRunnerStore((s) => s.correctCount);
  const wrongCount = useRunnerStore((s) => s.wrongCount);
  const combo = useRunnerStore((s) => s.combo);
  const maxCombo = useRunnerStore((s) => s.maxCombo);
  const chaserX = useRunnerStore((s) => s.chaserX);
  const selectedIndex = useRunnerStore((s) => s.selectedIndex);
  const revealed = useRunnerStore((s) => s.revealed);
  const lastCorrect = useRunnerStore((s) => s.lastCorrect);
  const lastEventStamp = useRunnerStore((s) => s.lastEventStamp);
  const lastGain = useRunnerStore((s) => s.lastGain);
  const level = useRunnerStore((s) => s.level);
  const lastLevelUpStamp = useRunnerStore((s) => s.lastLevelUpStamp);
  const characterStyle = useRunnerStore((s) => s.characterStyle);
  const setCharacterStyle = useRunnerStore((s) => s.setCharacterStyle);
  const start = useRunnerStore((s) => s.start);
  const answer = useRunnerStore((s) => s.answer);
  const tick = useRunnerStore((s) => s.tick);
  const reset = useRunnerStore((s) => s.reset);

  const lastFrameRef = useRef<number>(performance.now());
  const rafRef = useRef<number | null>(null);
  const screenShake = useAnimation();

  useEffect(() => {
    trackScreen("screen_runner_idle");
    return () => {
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 게임 루프
  useEffect(() => {
    if (status !== "playing") return;
    lastFrameRef.current = performance.now();
    const loop = (now: number) => {
      const delta = Math.min(48, now - lastFrameRef.current);
      lastFrameRef.current = now;
      tick(delta);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [status, tick]);

  // 오답 시 화면 흔들기
  useEffect(() => {
    if (lastCorrect === false) {
      screenShake.start({
        x: [0, -8, 8, -5, 5, 0],
        transition: { duration: 0.4 },
      });
    }
  }, [lastEventStamp, lastCorrect, screenShake]);

  useEffect(() => {
    if (status === "over") {
      trackClick("runner_game_over", {
        distance: Math.round(distance),
        correct: correctCount,
        wrong: wrongCount,
        max_combo: maxCombo,
        final_level: level,
      });
    }
  }, [status, distance, correctCount, wrongCount, maxCombo, level]);

  useAndroidBack(() => {
    trackClick("press_android_back", { from: "runner", status });
    reset();
    goHome();
  });

  const handleStart = () => {
    trackClick("runner_start");
    trackScreen("screen_runner_playing");
    start();
  };

  const handleRetry = () => {
    trackClick("runner_retry", {
      prev_distance: Math.round(distance),
      prev_max_combo: maxCombo,
      prev_level: level,
    });
    start();
  };

  const handleHome = () => {
    trackClick("runner_exit_to_home", { from_status: status });
    reset();
    goHome();
  };

  return (
    <motion.div
      animate={screenShake}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #000 0%, #1A0033 100%)",
        color: "#FFFFFF",
        padding: "16px 16px 24px",
        boxSizing: "border-box",
      }}
    >
      {/* 상단 HUD */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          marginBottom: 12,
          alignItems: "end",
        }}
      >
        <HudStat label="DISTANCE" value={distance.toFixed(1)} />
        <HudStat
          label="LEVEL"
          value={`${level}`}
          highlight={level >= 5}
          boostKey={lastLevelUpStamp}
        />
        <motion.div
          key={`combo-${combo}-${lastEventStamp}`}
          initial={combo > 0 ? { scale: 1.4 } : false}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{ textAlign: "right" }}
        >
          <div
            style={{
              fontSize: 11,
              opacity: 0.6,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            COMBO
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              lineHeight: 1,
              color: combo >= 5 ? "#FFEB3B" : "#FFFFFF",
            }}
          >
            x{combo}
            {combo >= 3 ? " 🔥" : ""}
          </div>
        </motion.div>
      </div>

      <div style={{ position: "relative" }}>
        <RunnerStage
          chaserX={chaserX}
          combo={combo}
          characterStyle={characterStyle}
          lastCorrect={lastCorrect}
          lastEventStamp={lastEventStamp}
          lastGain={lastGain}
        />

        {/* 레벨업 토스트 */}
        <AnimatePresence>
          {lastLevelUpStamp > 0 && Date.now() - lastLevelUpStamp < 1800 ? (
            <motion.div
              key={`lvlup-${lastLevelUpStamp}`}
              initial={{ opacity: 0, y: -10, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              style={{
                position: "absolute",
                top: 12,
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(255,193,7,0.95)",
                color: "#3E2723",
                fontSize: 14,
                fontWeight: 900,
                padding: "8px 16px",
                borderRadius: 999,
                letterSpacing: 1,
                boxShadow: "0 4px 14px rgba(255,193,7,0.6)",
                zIndex: 10,
              }}
            >
              ⚡ LEVEL {level} ⚡
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div style={{ marginTop: 16 }}>
        {status === "idle" ? (
          <IdleCard
            onStart={handleStart}
            onClose={handleHome}
            characterStyle={characterStyle}
            onChangeStyle={setCharacterStyle}
          />
        ) : null}

        {status === "playing" && question ? (
          <ChaseQuestionCard
            question={question}
            selectedIndex={selectedIndex}
            revealed={revealed}
            onSelect={(i) => answer(i)}
          />
        ) : null}

        {status === "over" ? (
          <GameOverCard
            distance={distance}
            correct={correctCount}
            wrong={wrongCount}
            maxCombo={maxCombo}
            finalLevel={level}
            onRetry={handleRetry}
            onHome={handleHome}
          />
        ) : null}
      </div>
    </motion.div>
  );
}

function HudStat({
  label,
  value,
  highlight,
  boostKey,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  boostKey?: number;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          opacity: 0.6,
          fontWeight: 700,
          letterSpacing: 2,
        }}
      >
        {label}
      </div>
      <motion.div
        key={boostKey ?? value}
        initial={boostKey ? { scale: 1.5 } : false}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          fontSize: 28,
          fontWeight: 900,
          lineHeight: 1,
          color: highlight ? "#FFEB3B" : "#FFFFFF",
        }}
      >
        {value}
      </motion.div>
    </div>
  );
}

function IdleCard({
  onStart,
  onClose,
  characterStyle,
  onChangeStyle,
}: {
  onStart: () => void;
  onClose: () => void;
  characterStyle: CharacterStyle;
  onChangeStyle: (style: CharacterStyle) => void;
}) {
  const styles: CharacterStyle[] = ["emoji", "svg", "big"];
  return (
    <div
      style={{
        background: "#FFFFFF",
        color: "#212121",
        borderRadius: 16,
        padding: 24,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 8 }}>🐯💨🏃</div>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
        무한 추격 모드 (DEV)
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#616161",
          lineHeight: 1.55,
          marginBottom: 18,
        }}
      >
        호랑이가 쫓아와요. 정답을 맞히면 호랑이를 뒤로 밀어내고, 콤보로 더 멀리
        달아나요. 시간 제한은 없지만 잡히면 끝.
      </div>

      {/* 캐릭터 스타일 picker */}
      <div
        style={{
          background: "#F5F5F5",
          borderRadius: 14,
          padding: "14px 12px",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#9E9E9E",
            fontWeight: 700,
            letterSpacing: 1.5,
            marginBottom: 10,
          }}
        >
          캐릭터 스타일
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
            marginBottom: 10,
          }}
        >
          {styles.map((s) => {
            const isSelected = s === characterStyle;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onChangeStyle(s)}
                style={{
                  padding: "10px 4px",
                  borderRadius: 10,
                  background: isSelected ? "#5D4037" : "#FFFFFF",
                  color: isSelected ? "#FFFFFF" : "#212121",
                  border: isSelected
                    ? "2px solid #5D4037"
                    : "2px solid #E0E0E0",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  lineHeight: 1.3,
                }}
              >
                {CHARACTER_STYLE_META[s].label}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 11, color: "#9E9E9E", marginBottom: 12 }}>
          {CHARACTER_STYLE_META[characterStyle].description}
        </div>
        {/* 미리보기 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "flex-end",
            background:
              "linear-gradient(180deg, #E1F5FE 0%, #FFFFFF 60%, #FFE0B2 100%)",
            borderRadius: 10,
            padding: "12px 8px 8px",
            minHeight: 110,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              transform: "scaleX(-1)",
            }}
          >
            <TigerByStyle style={characterStyle} />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <PlayerByStyle style={characterStyle} />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onStart}
        style={{
          width: "100%",
          padding: 16,
          borderRadius: 12,
          background: "#5D4037",
          color: "#FFFFFF",
          border: "none",
          fontSize: 16,
          fontWeight: 800,
          cursor: "pointer",
          marginBottom: 8,
        }}
      >
        시작하기
      </button>
      <button
        type="button"
        onClick={onClose}
        style={{
          width: "100%",
          padding: 12,
          background: "transparent",
          color: "#9E9E9E",
          border: "none",
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        닫기
      </button>
    </div>
  );
}

function GameOverCard({
  distance,
  correct,
  wrong,
  maxCombo,
  finalLevel,
  onRetry,
  onHome,
}: {
  distance: number;
  correct: number;
  wrong: number;
  maxCombo: number;
  finalLevel: number;
  onRetry: () => void;
  onHome: () => void;
}) {
  const accuracy =
    correct + wrong > 0
      ? Math.round((correct / (correct + wrong)) * 100)
      : 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        background: "#FFFFFF",
        color: "#212121",
        borderRadius: 16,
        padding: 22,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 4 }}>🐯</div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: "#C62828",
          marginBottom: 6,
        }}
      >
        잡혔어요!
      </div>
      <div
        style={{
          fontSize: 36,
          fontWeight: 900,
          marginBottom: 14,
          lineHeight: 1,
        }}
      >
        {distance.toFixed(1)}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 6,
          marginBottom: 18,
        }}
      >
        <Stat label="레벨" value={`${finalLevel}`} />
        <Stat label="정답" value={`${correct}`} />
        <Stat label="정답률" value={`${accuracy}%`} />
        <Stat label="최대콤보" value={`x${maxCombo}`} />
      </div>
      <button
        type="button"
        onClick={onRetry}
        style={{
          width: "100%",
          padding: 16,
          borderRadius: 12,
          background: "#5D4037",
          color: "#FFFFFF",
          border: "none",
          fontSize: 16,
          fontWeight: 800,
          cursor: "pointer",
          marginBottom: 8,
        }}
      >
        다시 도전
      </button>
      <button
        type="button"
        onClick={onHome}
        style={{
          width: "100%",
          padding: 12,
          background: "transparent",
          color: "#9E9E9E",
          border: "none",
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        홈으로
      </button>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "#F5F5F5",
        borderRadius: 10,
        padding: "10px 6px",
      }}
    >
      <div style={{ fontSize: 10, color: "#9E9E9E", marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 800, color: "#212121" }}>
        {value}
      </div>
    </div>
  );
}
