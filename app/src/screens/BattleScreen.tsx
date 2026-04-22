import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { BattleIntro } from "../components/BattleIntro";
import { BattleOutro } from "../components/BattleOutro";
import { ChoiceButton } from "../components/ChoiceButton";
import { ComboBadge } from "../components/ComboBadge";
import { DungeonBackground } from "../components/DungeonBackground";
import { EnemyScene } from "../components/EnemyScene";
import { FloatingDamage } from "../components/FloatingDamage";
import { ReviveOverlay } from "../components/ReviveOverlay";
import { RoomProgress } from "../components/RoomProgress";
import { SegmentedHPBar } from "../components/SegmentedHPBar";
import { SpeechBubble } from "../components/SpeechBubble";
import { Timer } from "../components/Timer";
import { ERA_THEME } from "../data/bosses";
import { STAGE_DEFS, stageTitle } from "../data/stages";
import { useRewardedAd } from "../hooks/useRewardedAd";
import { useAppStore } from "../store/useAppStore";
import { GAME_CONSTANTS, useGameStore } from "../store/useGameStore";

type Phase = "intro" | "fighting" | "revive" | "outro";

export function BattleScreen() {
  const navigate = useAppStore((s) => s.navigate);
  const {
    era,
    stageIndex,
    bossName,
    questions,
    currentIndex,
    playerHP,
    enemyHP,
    enemyMaxHP,
    combo,
    revealed,
    selectedIndex,
    lastResolution,
    reviveCount,
    answer,
    next,
    revive,
  } = useGameStore();

  const ad = useRewardedAd();
  const [phase, setPhase] = useState<Phase>("intro");
  const [hitKey, setHitKey] = useState(0);
  const [missKey, setMissKey] = useState(0);
  const [flashKey, setFlashKey] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);
  const questionStart = useRef<number>(performance.now());

  const theme = era ? ERA_THEME[era] : null;

  useEffect(() => {
    questionStart.current = performance.now();
  }, [currentIndex]);

  const question = questions[currentIndex];
  const chapterDone = useMemo(() => {
    if (questions.length === 0) return false;
    if (playerHP <= 0) return true;
    if (enemyHP <= 0) return true;
    return false;
  }, [playerHP, enemyHP, questions.length]);

  // 챕터 종료 → (1회 부활 기회) → outro → result
  useEffect(() => {
    if (phase !== "fighting") return;
    if (!chapterDone) return;
    // 플레이어만 쓰러지고 적은 살아있으면, 챕터당 한 번 부활 기회
    if (playerHP <= 0 && enemyHP > 0 && reviveCount === 0) {
      const t = setTimeout(() => setPhase("revive"), 450);
      return () => clearTimeout(t);
    }
    const outroTimer = setTimeout(() => setPhase("outro"), 450);
    return () => clearTimeout(outroTimer);
  }, [chapterDone, phase, playerHP, enemyHP, reviveCount]);

  useEffect(() => {
    if (phase !== "outro") return;
    const t = setTimeout(() => navigate("result"), 1600);
    return () => clearTimeout(t);
  }, [phase, navigate]);

  if (!era || !theme || !bossName) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p>전투를 준비 중입니다…</p>
      </div>
    );
  }

  const handleAnswer = (idx: number | null) => {
    if (revealed || phase !== "fighting") return;
    const elapsed = performance.now() - questionStart.current;
    const correct = idx !== null && idx === question?.answerIndex;
    if (correct) {
      setHitKey((k) => k + 1);
    } else {
      setMissKey((k) => k + 1);
      setFlashKey((k) => k + 1);
      setShakeKey((k) => k + 1);
    }
    answer(idx, elapsed);
  };

  const handleNext = () => {
    if (!revealed) return;
    next();
  };

  const choiceState = (idx: number) => {
    if (!revealed || !question) return "idle" as const;
    if (idx === question.answerIndex) return "correct" as const;
    if (idx === selectedIndex && selectedIndex !== question.answerIndex)
      return "wrong" as const;
    return "dimmed" as const;
  };

  const victory = playerHP > 0 && enemyHP <= 0;
  const fightingReady = phase === "fighting" && question != null;

  return (
    <DungeonBackground era={era} shakeKey={shakeKey} flashKey={flashKey}>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "60px 20px 8px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
              color: "#FFFFFF",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
                opacity: 0.85,
              }}
            >
              {era} · {stageTitle(STAGE_DEFS[stageIndex])}
            </div>
            <RoomProgress
              total={enemyMaxHP || 5}
              current={Math.max(0, enemyMaxHP - enemyHP)}
              accent={theme.accent}
            />
            <div style={{ minWidth: 60, textAlign: "right" }}>
              <ComboBadge combo={combo} />
            </div>
          </div>

          <SegmentedHPBar
            current={enemyHP}
            max={enemyMaxHP}
            label="🗡 적 HP"
            activeColor={theme.accent}
          />
        </div>

        <div
          style={{
            padding: "8px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
        >
          <EnemyScene
            era={era}
            name={bossName}
            hitKey={hitKey}
            missKey={missKey}
            critical={lastResolution?.critical}
          />

          {/* 플로팅 데미지 */}
          {lastResolution ? (
            <FloatingDamage
              show={revealed}
              value={
                lastResolution.correct ? lastResolution.damage : 1
              }
              kind={
                lastResolution.correct
                  ? "damage"
                  : selectedIndex === null
                    ? "miss"
                    : "hp-loss"
              }
              critical={lastResolution.critical}
              stamp={lastResolution.stamp}
            />
          ) : null}

          {question ? (
            <div style={{ width: "100%" }}>
              <SpeechBubble period={question.period} accent={theme.accent}>
                {question.question}
              </SpeechBubble>
            </div>
          ) : null}
        </div>

        {question && fightingReady ? (
          <div style={{ padding: "12px 20px 0" }}>
            <Timer
              durationMs={GAME_CONSTANTS.QUESTION_TIME_MS}
              running={!revealed}
              onExpire={() => handleAnswer(null)}
              resetKey={currentIndex}
            />
          </div>
        ) : null}

        <div
          style={{
            padding: "12px 20px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            flex: 1,
          }}
        >
          {question?.choices.map((c, i) => (
            <ChoiceButton
              key={i}
              index={i}
              label={c}
              state={choiceState(i)}
              disabled={revealed || !fightingReady}
              onClick={() => handleAnswer(i)}
              accent={theme.accent}
            />
          ))}
        </div>

        {/* 하단 내 HP */}
        <div style={{ padding: "0 20px 16px" }}>
          <SegmentedHPBar
            current={playerHP}
            max={GAME_CONSTANTS.MAX_PLAYER_HP}
            label="❤️ 내 HP"
            activeColor="#66BB6A"
          />
        </div>

        {/* 해설 하단 바텀시트 */}
        <AnimatePresence>
          {revealed && question ? (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 24 }}
              style={{
                background: "#FFFFFF",
                borderTop: `2px solid ${theme.accent}`,
                padding: "18px 20px 28px",
                boxShadow: "0 -8px 28px rgba(0,0,0,0.35)",
                color: "#212121",
              }}
            >
              <ExplanationBlock
                correct={selectedIndex === question.answerIndex}
                explanation={question.explanation}
                accent={theme.accent}
              />
              <div style={{ marginTop: 14 }}>
                <button
                  type="button"
                  onClick={handleNext}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: 12,
                    background: theme.nameBg,
                    color: "#FFFFFF",
                    border: `1.5px solid ${theme.accent}`,
                    fontSize: 15,
                    fontWeight: 800,
                    cursor: "pointer",
                    letterSpacing: 1,
                    boxShadow: `0 0 14px ${theme.frameGlow}`,
                  }}
                >
                  {playerHP <= 0 || enemyHP <= 0
                    ? "⚔ 챕터 종료"
                    : "다음 방 ▶"}
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <BattleIntro
          era={era}
          bossName={bossName}
          visible={phase === "intro"}
          onDone={() => setPhase("fighting")}
        />
        <ReviveOverlay
          visible={phase === "revive"}
          era={era}
          adReady={ad.ready}
          adSupported={ad.supported}
          onWatchAd={() => {
            ad.show(
              () => {
                revive(1);
                setPhase("fighting");
              },
              () => {
                // 사용자가 광고를 중간에 닫음 → 정상 게임오버로 진행
                setPhase("outro");
              },
            );
          }}
          onGiveUp={() => setPhase("outro")}
        />
        <BattleOutro visible={phase === "outro"} victory={victory} />
      </div>
    </DungeonBackground>
  );
}

function ExplanationBlock({
  correct,
  explanation,
  accent,
}: {
  correct: boolean;
  explanation: string;
  accent: string;
}) {
  return (
    <div>
      <div
        style={{
          display: "inline-block",
          padding: "4px 12px",
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 1,
          color: "#FFFFFF",
          background: correct ? "#43A047" : "#E53935",
          marginBottom: 10,
        }}
      >
        {correct ? "✦ 적중! " : "✘ 빗나감 "}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#616161",
          marginBottom: 6,
          fontWeight: 700,
          borderLeft: `3px solid ${accent}`,
          paddingLeft: 10,
        }}
      >
        📖 해설
      </div>
      <div style={{ fontSize: 14, color: "#424242", lineHeight: 1.65 }}>
        {explanation}
      </div>
    </div>
  );
}
