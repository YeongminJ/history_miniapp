import { Button } from "@toss/tds-mobile";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChoiceButton } from "../components/ChoiceButton";
import { ComboBadge } from "../components/ComboBadge";
import { EnemyFigure } from "../components/EnemyFigure";
import { HPBar } from "../components/HPBar";
import { SpeechBubble } from "../components/SpeechBubble";
import { Timer } from "../components/Timer";
import { useAppStore } from "../store/useAppStore";
import { GAME_CONSTANTS, useGameStore } from "../store/useGameStore";

export function BattleScreen() {
  const navigate = useAppStore((s) => s.navigate);
  const {
    era,
    questions,
    currentIndex,
    playerHP,
    enemyHP,
    enemyMaxHP,
    combo,
    revealed,
    selectedIndex,
    answer,
    next,
  } = useGameStore();

  const question = questions[currentIndex];
  const questionStart = useRef<number>(performance.now());
  const [hitKey, setHitKey] = useState(0);
  const [missKey, setMissKey] = useState(0);

  useEffect(() => {
    questionStart.current = performance.now();
  }, [currentIndex]);

  const isChapterEnd = useMemo(() => {
    if (!question) return true;
    if (playerHP <= 0) return true;
    if (enemyHP <= 0) return true;
    if (currentIndex >= questions.length) return true;
    return false;
  }, [question, playerHP, enemyHP, currentIndex, questions.length]);

  useEffect(() => {
    if (isChapterEnd && questions.length > 0) {
      const t = setTimeout(() => navigate("result"), 900);
      return () => clearTimeout(t);
    }
  }, [isChapterEnd, questions.length, navigate]);

  if (!question || !era) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p>전투를 준비 중입니다…</p>
      </div>
    );
  }

  const handleAnswer = (idx: number | null) => {
    if (revealed) return;
    const elapsed = performance.now() - questionStart.current;
    const correct = idx !== null && idx === question.answerIndex;
    if (correct) setHitKey((k) => k + 1);
    else setMissKey((k) => k + 1);
    answer(idx, elapsed);
  };

  const handleNext = () => {
    if (!revealed) return;
    next();
  };

  const choiceState = (idx: number) => {
    if (!revealed) return "idle" as const;
    if (idx === question.answerIndex) return "correct" as const;
    if (idx === selectedIndex && selectedIndex !== question.answerIndex)
      return "wrong" as const;
    return "dimmed" as const;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #FAFAFA 0%, #F5F5F5 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: "16px 20px 8px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <div style={{ fontSize: 12, color: "#757575", fontWeight: 600 }}>
            {era} · {currentIndex + 1} / {questions.length}
          </div>
          <ComboBadge combo={combo} />
        </div>
        <HPBar current={enemyHP} max={enemyMaxHP} label="🗡 적 HP" />
      </div>

      <div
        style={{
          padding: "16px 20px 8px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <EnemyFigure era={era} hitKey={hitKey} missKey={missKey} />
        <div style={{ width: "100%", marginTop: 8 }}>
          <SpeechBubble period={question.period}>
            {question.question}
          </SpeechBubble>
        </div>
      </div>

      <div style={{ padding: "8px 20px" }}>
        <Timer
          durationMs={GAME_CONSTANTS.QUESTION_TIME_MS}
          running={!revealed}
          onExpire={() => handleAnswer(null)}
          resetKey={currentIndex}
        />
      </div>

      <div
        style={{
          padding: "8px 20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          flex: 1,
        }}
      >
        {question.choices.map((c, i) => (
          <ChoiceButton
            key={i}
            index={i}
            label={c}
            state={choiceState(i)}
            disabled={revealed}
            onClick={() => handleAnswer(i)}
          />
        ))}
      </div>

      <AnimatePresence>
        {revealed ? (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              background: "#FFFFFF",
              borderTop: "1.5px solid #EEEEEE",
              padding: "16px 20px 24px",
              boxShadow: "0 -4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <ExplanationBlock
              correct={selectedIndex === question.answerIndex}
              explanation={question.explanation}
            />
            <div style={{ marginTop: 12 }}>
              <Button size="xlarge" display="full" onClick={handleNext}>
                {currentIndex + 1 < questions.length &&
                playerHP > (selectedIndex === question.answerIndex ? -1 : 1) &&
                enemyHP > (selectedIndex === question.answerIndex ? 1 : 0)
                  ? "다음"
                  : "결과 보기"}
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div style={{ padding: "0 20px 12px" }}>
        <HPBar
          current={playerHP}
          max={GAME_CONSTANTS.MAX_PLAYER_HP}
          label="❤️ 내 HP"
          color="#43A047"
          small
        />
      </div>
    </div>
  );
}

function ExplanationBlock({
  correct,
  explanation,
}: {
  correct: boolean;
  explanation: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: correct ? "#2E7D32" : "#C62828",
          marginBottom: 6,
        }}
      >
        {correct ? "✔ 정답!" : "✘ 오답"}
      </div>
      <div style={{ fontSize: 14, color: "#424242", lineHeight: 1.6 }}>
        {explanation}
      </div>
    </div>
  );
}
