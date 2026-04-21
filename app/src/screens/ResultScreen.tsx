import { Button, Top } from "@toss/tds-mobile";
import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { useGameStore } from "../store/useGameStore";
import { useProgressStore } from "../store/useProgressStore";

export function ResultScreen() {
  const { era, answers, score, reset } = useGameStore();
  const goHome = useAppStore((s) => s.goHome);
  const navigate = useAppStore((s) => s.navigate);
  const recordChapter = useProgressStore((s) => s.recordChapter);
  const recorded = useRef(false);
  const [showAllExplanations, setShowAllExplanations] = useState(false);

  const correctCount = answers.filter((a) => a.correct).length;
  const accuracy =
    answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;
  const wrongAnswers = answers.filter((a) => !a.correct);

  useEffect(() => {
    if (recorded.current) return;
    if (!era || answers.length === 0) return;
    recordChapter({
      era,
      answeredIds: answers.map((a) => a.question.id),
      correctCount,
      score,
    });
    recorded.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleHome = () => {
    reset();
    goHome();
  };

  const handleRetry = () => {
    if (!era) return;
    useGameStore.getState().startBattle(era);
    navigate("battle");
  };

  return (
    <div style={{ paddingBottom: 120 }}>
      <Top
        title={
          <Top.TitleParagraph size={22}>
            {correctCount === answers.length && answers.length > 0
              ? "완벽 정복!"
              : correctCount > 0
                ? "전투 종료"
                : "아쉬운 패배"}
          </Top.TitleParagraph>
        }
        subtitleBottom={
          <Top.SubtitleParagraph size={15}>
            {era} 챕터 · {correctCount} / {answers.length} 정답
          </Top.SubtitleParagraph>
        }
      />

      <div style={{ padding: "8px 20px 20px" }}>
        <div
          style={{
            background:
              correctCount === answers.length
                ? "linear-gradient(135deg, #43A047 0%, #2E7D32 100%)"
                : "linear-gradient(135deg, #5D4037 0%, #3E2723 100%)",
            borderRadius: 20,
            padding: 24,
            color: "#FFFFFF",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 6 }}>
            획득 점수
          </div>
          <div style={{ fontSize: 48, fontWeight: 800 }}>{score}</div>
          <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
            정답률 {accuracy}%
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

        {answers.length > 0 && wrongAnswers.length === 0 ? null : (
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

        <div style={{ display: "flex", gap: 10 }}>
          <Button
            size="xlarge"
            display="full"
            variant="weak"
            color="dark"
            onClick={handleHome}
          >
            홈으로
          </Button>
          <Button size="xlarge" display="full" onClick={handleRetry}>
            다시 도전
          </Button>
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
  q: import("../types").Question;
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
        정답: <span style={{ color: "#2E7D32", fontWeight: 700 }}>{correctText}</span>
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
