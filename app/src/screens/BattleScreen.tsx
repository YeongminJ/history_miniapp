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
import { HeartHPBar } from "../components/HeartHPBar";
import { SegmentedHPBar } from "../components/SegmentedHPBar";
import { SpeechBubble } from "../components/SpeechBubble";
import { Timer } from "../components/Timer";
import { ERA_THEME } from "../data/bosses";
import { roleOf } from "../data/roles";
import { STAGE_DEFS, stageTitle } from "../data/stages";
import { useInterstitialAd } from "../hooks/useInterstitialAd";
import { trackClick, trackScreen } from "../lib/track";
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

  const ad = useInterstitialAd();
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

  // 전투 진입 + 챕터 시작 로그 (보스·역할·스테이지 파라미터)
  useEffect(() => {
    if (!era || !bossName) return;
    const role = roleOf(era, bossName);
    const stageLabel = STAGE_DEFS[stageIndex]?.label ?? "";
    trackScreen("screen_battle", {
      era,
      stage_index: stageIndex,
      stage_label: stageLabel,
      boss_name: bossName,
      boss_role: role,
    });
    trackClick("chapter_start", {
      era,
      stage_index: stageIndex,
      stage_label: stageLabel,
      boss_name: bossName,
      boss_role: role,
    });
    // 전투 한 판에 한 번만 발송 (era/stage/boss가 바뀔 때만 재트리거)
  }, [era, stageIndex, bossName]);

  // 부활 프롬프트 노출 로그
  useEffect(() => {
    if (phase !== "revive" || !era) return;
    trackClick("revive_prompt_shown", {
      era,
      stage_index: stageIndex,
    });
  }, [phase, era, stageIndex]);

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
    if (question && era) {
      if (idx === null) {
        trackClick("question_timeout", {
          era,
          stage_index: stageIndex,
          difficulty: question.difficulty,
          question_id: question.id,
        });
      } else {
        trackClick("press_answer_choice", {
          era,
          stage_index: stageIndex,
          difficulty: question.difficulty,
          question_id: question.id,
          correct,
          time_ms: Math.round(elapsed),
        });
      }
    }
    answer(idx, elapsed);
  };

  const handleNext = () => {
    if (!revealed) return;
    if (era) {
      trackClick("press_next_room", { era, stage_index: stageIndex });
    }
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

          {/* 적 피해 팝업 (HP 바 + 점수) */}
          {lastResolution?.correct ? (
            <FloatingDamage
              show={revealed}
              stamp={lastResolution.stamp}
              label={lastResolution.critical ? "CRITICAL! -1" : "-1"}
              color={lastResolution.critical ? "#FFEB3B" : "#FF5252"}
              critical={lastResolution.critical}
              sub={`+${lastResolution.damage}점`}
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

        {/* 하단 내 HP (하트) + 플레이어 피격 팝업 */}
        <div
          style={{
            padding: "0 20px 16px",
            position: "relative",
          }}
        >
          <HeartHPBar
            current={playerHP}
            max={GAME_CONSTANTS.MAX_PLAYER_HP}
            label="내 HP"
          />
          {lastResolution && !lastResolution.correct ? (
            <FloatingDamage
              show={revealed}
              stamp={lastResolution.stamp}
              label={
                selectedIndex === null ? (
                  <span>⏱ MISS 💔</span>
                ) : (
                  <span>💔 -1</span>
                )
              }
              color="#EF5350"
            />
          ) : null}
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
          adLoading={ad.loading}
          adIsTest={ad.isTest}
          onWatchAd={() => {
            trackClick("revive_ad_click", {
              era,
              stage_index: stageIndex,
            });
            ad.show(
              () => {
                trackClick("revive_ad_rewarded", {
                  era,
                  stage_index: stageIndex,
                });
                revive(1);
                setPhase("fighting");
              },
              () => {
                trackClick("revive_ad_dismissed", {
                  era,
                  stage_index: stageIndex,
                });
                setPhase("outro");
              },
            );
          }}
          onGiveUp={() => {
            trackClick("revive_give_up", { era, stage_index: stageIndex });
            setPhase("outro");
          }}
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
