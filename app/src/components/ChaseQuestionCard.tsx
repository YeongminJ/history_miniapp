import type { Question } from "../types";

interface Props {
  question: Question;
  selectedIndex: number | null;
  revealed: boolean;
  onSelect: (index: number) => void;
}

/**
 * 무한 추격 모드용 컴팩트 문제 카드.
 * 시간 제한 없음 — 호랑이 자체가 시간 압박.
 * 4지선다 2x2 그리드로 빠른 탭 가능.
 */
export function ChaseQuestionCard({
  question,
  selectedIndex,
  revealed,
  onSelect,
}: Props) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 16,
        padding: "14px 16px 16px",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.12)",
      }}
    >
      {/* 발문 */}
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "#212121",
          lineHeight: 1.45,
          marginBottom: 12,
          minHeight: 44,
        }}
      >
        {question.question}
      </div>

      {/* 4지선다 — 2x2 그리드 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        {question.choices.map((choice, i) => {
          const isSelected = selectedIndex === i;
          const isAnswer = revealed && i === question.answerIndex;
          const isWrong = revealed && isSelected && !isAnswer;
          const bg = isAnswer
            ? "#43A047"
            : isWrong
              ? "#E53935"
              : revealed
                ? "#F5F5F5"
                : "#FAFAFA";
          const color = isAnswer || isWrong ? "#FFFFFF" : "#212121";
          const border = isAnswer
            ? "2px solid #2E7D32"
            : isWrong
              ? "2px solid #C62828"
              : "2px solid transparent";

          return (
            <button
              key={i}
              type="button"
              disabled={revealed}
              onClick={() => onSelect(i)}
              style={{
                padding: "12px 10px",
                fontSize: 13,
                fontWeight: 700,
                color,
                background: bg,
                border,
                borderRadius: 12,
                cursor: revealed ? "default" : "pointer",
                minHeight: 56,
                lineHeight: 1.3,
                textAlign: "center",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {choice}
            </button>
          );
        })}
      </div>
    </div>
  );
}
