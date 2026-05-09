import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { ERA_BOSS_EMOJI, ERA_THEME } from "../data/bosses";
import {
  STAGE_DEFS,
  isStageUnlocked,
  stageTitle,
} from "../data/stages";
import { useAndroidBack } from "../hooks/useAndroidBack";
import { trackClick, trackScreen } from "../lib/track";
import { useAppStore } from "../store/useAppStore";
import { useGameStore } from "../store/useGameStore";
import { useProgressStore } from "../store/useProgressStore";

export function StageScreen() {
  const era = useAppStore((s) => s.selectedEra);
  const navigate = useAppStore((s) => s.navigate);
  const selectStage = useAppStore((s) => s.selectStage);
  const clearedStages = useProgressStore((s) => s.clearedStages);
  const startBattle = useGameStore((s) => s.startBattle);

  const stages = useMemo(() => STAGE_DEFS, []);

  useEffect(() => {
    if (!era) return;
    trackScreen("screen_stage_list", {
      era,
      cleared_count: (clearedStages[era] ?? []).length,
    });
  }, [era, clearedStages]);

  useAndroidBack(() => {
    trackClick("press_android_back", { from: "stage_list", era });
    navigate("chapter");
  });

  if (!era) {
    return (
      <div style={{ padding: 40 }}>
        시대가 선택되지 않았어요.{" "}
        <button onClick={() => navigate("chapter")}>뒤로</button>
      </div>
    );
  }

  const theme = ERA_THEME[era];
  const cleared = clearedStages[era] ?? [];

  const enter = (stageIndex: number) => {
    const stage = STAGE_DEFS[stageIndex];
    trackClick("press_select_stage", {
      era,
      stage_index: stageIndex,
      stage_label: stage?.label ?? "",
      boss_stage: stage?.boss ?? false,
    });
    startBattle(era, stageIndex);
    selectStage(stageIndex);
  };

  const progressPct = Math.round((cleared.length / stages.length) * 100);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bgGradient,
        color: "#FFFFFF",
        paddingBottom: 40,
      }}
    >
      {/* 헤더 */}
      <div style={{ padding: "60px 20px 24px" }}>
        <button
          type="button"
          onClick={() => {
            trackClick("press_back_to_chapter_map", { from: "stage_list", era });
            navigate("chapter");
          }}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.75)",
            fontSize: 14,
            marginBottom: 20,
            cursor: "pointer",
            padding: 0,
          }}
        >
          ← 시대 선택
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 44, lineHeight: 1 }}>
            {ERA_BOSS_EMOJI[era]}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: theme.accent,
                letterSpacing: 1,
              }}
            >
              {era} 던전
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
              스테이지 {cleared.length} / {stages.length} 클리어 · {progressPct}%
            </div>
          </div>
        </div>
        {/* 진행 바 */}
        <div
          style={{
            height: 6,
            width: "100%",
            background: "rgba(255,255,255,0.1)",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            style={{
              height: "100%",
              background: theme.accent,
              borderRadius: 999,
            }}
          />
        </div>
      </div>

      {/* 스테이지 카드 리스트 */}
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {stages.map((stage, idx) => {
          const unlocked = isStageUnlocked(era, stage.index, clearedStages);
          const done = cleared.includes(stage.index);
          return (
            <motion.button
              key={stage.index}
              type="button"
              disabled={!unlocked}
              onClick={() => unlocked && enter(stage.index)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: unlocked ? 1 : 0.55, x: 0 }}
              transition={{ delay: idx * 0.07, duration: 0.3 }}
              whileTap={unlocked ? { scale: 0.98 } : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 18px",
                borderRadius: 14,
                background: done
                  ? `linear-gradient(135deg, ${theme.accent}33 0%, ${theme.accent}11 100%)`
                  : unlocked
                    ? "rgba(255,255,255,0.07)"
                    : "rgba(255,255,255,0.03)",
                border: `1.5px solid ${done ? theme.accent : unlocked ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)"}`,
                cursor: unlocked ? "pointer" : "not-allowed",
                textAlign: "left",
                color: "#FFFFFF",
                boxShadow: done ? `0 0 16px ${theme.accent}40` : undefined,
              }}
            >
              <StageBadge
                stageIndex={stage.index}
                boss={stage.boss}
                cleared={done}
                unlocked={unlocked}
                accent={theme.accent}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    letterSpacing: 0.5,
                    color: unlocked ? "#FFFFFF" : "rgba(255,255,255,0.6)",
                  }}
                >
                  {stageTitle(stage)}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.65)",
                    marginTop: 3,
                  }}
                >
                  {difficultyLabel(stage.profile)}
                  {stage.boss ? " · 보스전" : ""}
                </div>
              </div>
              <div style={{ fontSize: 18, color: theme.accent, opacity: 0.85 }}>
                {!unlocked ? "🔒" : done ? "★" : "›"}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function StageBadge({
  stageIndex,
  boss,
  cleared,
  unlocked,
  accent,
}: {
  stageIndex: number;
  boss: boolean;
  cleared: boolean;
  unlocked: boolean;
  accent: string;
}) {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: boss ? 8 : 999,
        background: cleared
          ? accent
          : unlocked
            ? "rgba(255,255,255,0.12)"
            : "rgba(255,255,255,0.05)",
        border: `1.5px solid ${cleared ? accent : "rgba(255,255,255,0.2)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 900,
        fontSize: boss ? 18 : 16,
        color: cleared ? "#000" : unlocked ? "#FFFFFF" : "rgba(255,255,255,0.4)",
        boxShadow: cleared ? `0 0 12px ${accent}88` : undefined,
      }}
    >
      {boss ? "👑" : stageIndex + 1}
    </div>
  );
}

function difficultyLabel(profile: Record<string, number>): string {
  const parts: string[] = [];
  if (profile.easy) parts.push(`쉬움×${profile.easy}`);
  if (profile.medium) parts.push(`보통×${profile.medium}`);
  if (profile.hard) parts.push(`어려움×${profile.hard}`);
  return parts.join(" · ");
}
