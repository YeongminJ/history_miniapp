import { Top } from "@toss/tds-mobile";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { ERAS, byEra } from "../data/quiz";
import { STAGES_PER_ERA } from "../data/stages";
import { useAndroidBack } from "../hooks/useAndroidBack";
import { trackClick, trackScreen } from "../lib/track";
import { useAppStore } from "../store/useAppStore";
import { useProgressStore } from "../store/useProgressStore";

export function ChapterMapScreen() {
  const goHome = useAppStore((s) => s.goHome);
  const selectEra = useAppStore((s) => s.selectEra);
  const clearedStages = useProgressStore((s) => s.clearedStages);

  useEffect(() => {
    trackScreen("screen_chapter_map");
  }, []);

  useAndroidBack(() => {
    trackClick("press_android_back", { from: "chapter_map" });
    goHome();
  });

  return (
    <div style={{ paddingBottom: 40 }}>
      <Top
        title={
          <Top.TitleParagraph size={22}>시대를 선택하세요</Top.TitleParagraph>
        }
        subtitleBottom={
          <Top.SubtitleParagraph size={15}>
            각 시대마다 5개 스테이지가 준비돼 있어요
          </Top.SubtitleParagraph>
        }
      />

      <div style={{ padding: "8px 20px 20px" }}>
        {ERAS.map((e, idx) => {
          const cleared = (clearedStages[e.era] ?? []).length;
          const poolSize = byEra[e.era].length;
          const pct = Math.round((cleared / STAGES_PER_ERA) * 100);
          return (
            <motion.button
              key={e.era}
              type="button"
              onClick={() => {
                trackClick("press_select_era", {
                  era: e.era,
                  cleared_stages: cleared,
                });
                selectEra(e.era);
              }}
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
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 8,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: 5,
                      background: "rgba(255,255,255,0.25)",
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: "#FFFFFF",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.9, minWidth: 50 }}>
                    {cleared}/{STAGES_PER_ERA} ({poolSize}문제)
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 20, opacity: 0.7 }}>›</div>
            </motion.button>
          );
        })}

        <button
          type="button"
          onClick={() => {
            trackClick("press_back_to_home", { from: "chapter_map" });
            goHome();
          }}
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
