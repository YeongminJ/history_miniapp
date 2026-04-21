import { Top } from "@toss/tds-mobile";
import { motion } from "framer-motion";
import { ERAS, byEra } from "../data/quiz";
import { useAppStore } from "../store/useAppStore";
import { useGameStore } from "../store/useGameStore";
import { useProgressStore } from "../store/useProgressStore";
import type { Era } from "../types";

export function ChapterMapScreen() {
  const goHome = useAppStore((s) => s.goHome);
  const startBattle = useGameStore((s) => s.startBattle);
  const startChapter = useAppStore((s) => s.startChapter);
  const progress = useProgressStore((s) => s.byEra);

  const enter = (era: Era) => {
    startBattle(era);
    startChapter(era);
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      <Top
        title={<Top.TitleParagraph size={22}>챕터를 선택하세요</Top.TitleParagraph>}
        subtitleBottom={
          <Top.SubtitleParagraph size={15}>
            각 시대의 역사 인물이 기다리고 있어요
          </Top.SubtitleParagraph>
        }
      />

      <div style={{ padding: "8px 20px 20px" }}>
        {ERAS.map((e, idx) => {
          const stat = progress[e.era];
          const poolSize = byEra[e.era].length;
          const accuracy =
            stat.played > 0
              ? Math.round((stat.correct / stat.played) * 100)
              : null;
          return (
            <motion.button
              key={e.era}
              type="button"
              onClick={() => enter(e.era)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.3 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                width: "100%",
                padding: "18px 18px",
                marginBottom: 12,
                borderRadius: 18,
                background: `linear-gradient(135deg, ${e.color} 0%, ${e.color}CC 100%)`,
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                color: "#FFFFFF",
                boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ fontSize: 48, lineHeight: 1 }}>{e.emoji}</div>
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontSize: 20, fontWeight: 800, marginBottom: 2 }}
                >
                  {e.era}
                </div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>{e.range}</div>
                <div
                  style={{
                    fontSize: 11,
                    opacity: 0.75,
                    marginTop: 6,
                  }}
                >
                  문제 {poolSize}개
                  {accuracy !== null ? ` · 정답률 ${accuracy}%` : ""}
                  {stat.bestScore > 0 ? ` · 최고 ${stat.bestScore}` : ""}
                </div>
              </div>
              <div style={{ fontSize: 20, opacity: 0.7 }}>›</div>
            </motion.button>
          );
        })}

        <button
          type="button"
          onClick={goHome}
          style={{
            width: "100%",
            padding: "14px",
            marginTop: 12,
            background: "transparent",
            border: "none",
            color: "#757575",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          ← 홈으로
        </button>
      </div>
    </div>
  );
}
