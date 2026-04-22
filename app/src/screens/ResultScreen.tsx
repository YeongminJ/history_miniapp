import { Button, Top } from "@toss/tds-mobile";
import { useEffect, useRef, useState } from "react";
import { ERA_THEME } from "../data/bosses";
import {
  STAGE_DEFS,
  getStage,
  isStageUnlocked,
  stageTitle,
} from "../data/stages";
import { useAppStore } from "../store/useAppStore";
import { useGameStore } from "../store/useGameStore";
import { useProgressStore } from "../store/useProgressStore";
import type { Question } from "../types";

export function ResultScreen() {
  const { era, stageIndex, answers, score, reset } = useGameStore();
  const goHome = useAppStore((s) => s.goHome);
  const backToStages = useAppStore((s) => s.backToStages);
  const selectStage = useAppStore((s) => s.selectStage);
  const recordChapter = useProgressStore((s) => s.recordChapter);
  const clearedStages = useProgressStore((s) => s.clearedStages);
  const recorded = useRef(false);
  const [showAllExplanations, setShowAllExplanations] = useState(false);

  const correctCount = answers.filter((a) => a.correct).length;
  const accuracy =
    answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;
  const wrongAnswers = answers.filter((a) => !a.correct);

  const stage = era ? getStage(stageIndex) : null;
  const cleared = !!stage && correctCount >= stage.minCorrectToClear;

  useEffect(() => {
    if (recorded.current) return;
    if (!era || answers.length === 0) return;
    recordChapter({
      era,
      stageIndex,
      cleared,
      answeredIds: answers.map((a) => a.question.id),
      correctCount,
      score,
    });
    recorded.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBack = () => {
    reset();
    backToStages();
  };

  const handleHome = () => {
    reset();
    goHome();
  };

  const handleRetry = () => {
    if (!era) return;
    useGameStore.getState().startBattle(era, stageIndex);
    selectStage(stageIndex);
  };

  const handleNextStage = () => {
    if (!era) return;
    const nextIdx = stageIndex + 1;
    if (nextIdx >= STAGE_DEFS.length) {
      handleBack();
      return;
    }
    // recordChapter 이후 clearedStages가 갱신되었어야 하므로 즉시 다음 스테이지 시작
    useGameStore.getState().startBattle(era, nextIdx);
    selectStage(nextIdx);
  };

  const theme = era ? ERA_THEME[era] : null;

  const nextUnlocked =
    era && stage
      ? stageIndex + 1 < STAGE_DEFS.length &&
        (cleared || isStageUnlocked(era, stageIndex + 1, clearedStages))
      : false;

  if (!era || !stage) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p>결과를 불러올 수 없어요.</p>
        <Button onClick={handleHome}>홈으로</Button>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 120 }}>
      <Top
        title={
          <Top.TitleParagraph size={22}>
            {cleared ? "스테이지 클리어!" : "클리어 실패"}
          </Top.TitleParagraph>
        }
        subtitleBottom={
          <Top.SubtitleParagraph size={15}>
            {era} · {stageTitle(stage)} · {correctCount} / {answers.length} 정답
          </Top.SubtitleParagraph>
        }
      />

      <div style={{ padding: "8px 20px 20px" }}>
        <div
          style={{
            background: cleared
              ? `linear-gradient(135deg, ${theme?.accent}BB 0%, ${theme?.accent}77 100%)`
              : "linear-gradient(135deg, #616161 0%, #424242 100%)",
            borderRadius: 20,
            padding: 24,
            color: "#FFFFFF",
            marginBottom: 16,
            textAlign: "center",
            boxShadow: cleared
              ? `0 4px 24px ${theme?.frameGlow ?? "transparent"}`
              : undefined,
          }}
        >
          <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 6 }}>
            {cleared ? "✦ VICTORY ✦" : "클리어 조건"}
          </div>
          <div style={{ fontSize: 48, fontWeight: 900 }}>{score}</div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
            {cleared
              ? `정답률 ${accuracy}%`
              : `정답 ${correctCount}/${stage.minCorrectToClear}개 필요 · 정답률 ${accuracy}%`}
          </div>
        </div>

        {wrongAnswers.length > 0 ? (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: "#424242" }}>
                틀린 문제 {wrongAnswers.length}개
              </div>
              <button
                type="button"
                onClick={() => setShowAllExplanations((v) => !v)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#1E88E5",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {showAllExplanations ? "접기" : "해설 모두 보기"}
              </button>
            </div>
            {wrongAnswers.map((a) => (
              <ReviewCard
                key={a.question.id}
                q={a.question}
                selected={a.selectedIndex}
                expanded={showAllExplanations}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: "16px",
              background: "#E8F5E9",
              borderRadius: 12,
              color: "#2E7D32",
              fontSize: 14,
              fontWeight: 600,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            🎉 모든 문제를 맞혔어요!
          </div>
        )}

        {wrongAnswers.length === 0 ? null : (
          <details
            style={{
              marginBottom: 16,
              padding: "12px 16px",
              background: "#F5F5F5",
              borderRadius: 12,
            }}
          >
            <summary
              style={{
                cursor: "pointer",
                fontSize: 13,
                color: "#616161",
                fontWeight: 600,
              }}
            >
              맞힌 문제도 보기
            </summary>
            <div style={{ marginTop: 10 }}>
              {answers
                .filter((a) => a.correct)
                .map((a) => (
                  <ReviewCard
                    key={a.question.id}
                    q={a.question}
                    selected={a.selectedIndex}
                    expanded={showAllExplanations}
                  />
                ))}
            </div>
          </details>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {cleared && nextUnlocked ? (
            <Button
              size="xlarge"
              display="full"
              onClick={handleNextStage}
            >
              다음 스테이지로 ▶
            </Button>
          ) : (
            <Button size="xlarge" display="full" onClick={handleRetry}>
              다시 도전
            </Button>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <Button
              size="large"
              display="full"
              variant="weak"
              color="dark"
              onClick={handleBack}
            >
              스테이지 목록
            </Button>
            <Button
              size="large"
              display="full"
              variant="weak"
              color="dark"
              onClick={handleHome}
            >
              홈으로
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({
  q,
  selected,
  expanded,
}: {
  q: Question;
  selected: number | null;
  expanded: boolean;
}) {
  const correctText = q.choices[q.answerIndex];
  const selectedText = selected !== null ? q.choices[selected] : "시간 초과";
  return (
    <div
      style={{
        padding: "14px 16px",
        background: "#FFFFFF",
        border: "1.5px solid #F0F0F0",
        borderRadius: 12,
        marginBottom: 8,
      }}
    >
      <div style={{ fontSize: 11, color: "#9E9E9E", marginBottom: 4 }}>
        {q.period} · {q.difficulty}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#212121",
          marginBottom: 8,
        }}
      >
        {q.question}
      </div>
      <div style={{ fontSize: 13, color: "#616161", marginBottom: 4 }}>
        내 답: <span style={{ color: "#C62828" }}>{selectedText}</span>
      </div>
      <div style={{ fontSize: 13, color: "#616161", marginBottom: 8 }}>
        정답:{" "}
        <span style={{ color: "#2E7D32", fontWeight: 700 }}>{correctText}</span>
      </div>
      {expanded ? (
        <div
          style={{
            fontSize: 13,
            color: "#424242",
            lineHeight: 1.55,
            background: "#FAFAFA",
            padding: "10px 12px",
            borderRadius: 8,
          }}
        >
          {q.explanation}
        </div>
      ) : null}
    </div>
  );
}
