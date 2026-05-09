import { Button, Top } from "@toss/tds-mobile";
import { useEffect, useRef, useState } from "react";
import { NotificationPromptOverlay } from "../components/NotificationPromptOverlay";
import { ERA_THEME } from "../data/bosses";
import {
  STAGE_DEFS,
  getStage,
  isStageUnlocked,
  stageTitle,
} from "../data/stages";
import { useAndroidBack } from "../hooks/useAndroidBack";
import { ensureUserKey, recordPlay, registerUser } from "../lib/api";
import { shareResult } from "../lib/share";
import { trackClick, trackScreen } from "../lib/track";
import { useAppStore } from "../store/useAppStore";
import { useGameStore } from "../store/useGameStore";
import { useNotificationStore } from "../store/useNotificationStore";
import { useProgressStore } from "../store/useProgressStore";
import type { Question } from "../types";

export function ResultScreen() {
  const {
    era,
    stageIndex,
    answers,
    score,
    maxCombo,
    reviveCount,
    reset,
  } = useGameStore();
  const goHome = useAppStore((s) => s.goHome);
  const backToStages = useAppStore((s) => s.backToStages);
  const selectStage = useAppStore((s) => s.selectStage);
  const recordChapter = useProgressStore((s) => s.recordChapter);
  const clearedStages = useProgressStore((s) => s.clearedStages);
  const notiStatus = useNotificationStore((s) => s.status);
  const markRegistered = useNotificationStore((s) => s.markRegistered);
  const markDismissed = useNotificationStore((s) => s.markDismissed);
  const recorded = useRef(false);
  const [showAllExplanations, setShowAllExplanations] = useState(true);
  const [showNotiPrompt, setShowNotiPrompt] = useState(false);

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
    trackScreen("screen_result", {
      era,
      stage_index: stageIndex,
      cleared,
      correct: correctCount,
      total: answers.length,
      score,
    });
    trackClick(cleared ? "chapter_clear" : "chapter_fail", {
      era,
      stage_index: stageIndex,
      correct: correctCount,
      total: answers.length,
      score,
      max_combo: maxCombo,
      revived: reviveCount > 0,
    });
    recorded.current = true;

    // 이미 등록된 사용자: 클리어 시에만 서버 스트릭 갱신.
    // userKey는 캐시되어 있으므로 ensureUserKey가 토스 로그인을 트리거하지 않음.
    if (notiStatus === "registered" && cleared) {
      void (async () => {
        const key = await ensureUserKey();
        if (key) await recordPlay(key);
      })();
    }

    // 미등록/거절 상태: 로그인은 사용자가 "등록" 버튼 눌렀을 때만 시작.
    // 여기서는 prompt 노출 여부만 결정.
    if (notiStatus !== "registered") {
      const shouldShow = useNotificationStore.getState().shouldPromptOnResult();
      if (shouldShow) setShowNotiPrompt(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNotiRegister = async (reminderMinute: number) => {
    const key = await ensureUserKey();
    if (!key) {
      // useEffect에서 userKey 발급된 케이스만 prompt 띄우므로 여기 도달은 드물지만 방어.
      console.warn("[noti] userKey 발급 실패, 등록 건너뜀");
      setShowNotiPrompt(false);
      return;
    }
    const ok = await registerUser({ userKey: key, reminderMinute });
    if (!ok) {
      console.warn("[noti] registerUser 실패 — 다음 결과 화면에서 재시도");
      setShowNotiPrompt(false);
      return;
    }
    markRegistered(reminderMinute);
    trackClick("noti_register", { reminder_minute: reminderMinute, cleared });
    // 클리어한 결과면 방금 끝낸 챕터를 스트릭 시작점으로 기록
    if (cleared) {
      await recordPlay(key);
    }
    setShowNotiPrompt(false);
  };

  const handleNotiDismiss = () => {
    markDismissed();
    trackClick("noti_dismiss", { cleared });
    setShowNotiPrompt(false);
  };

  const handleBack = () => {
    trackClick("press_back_to_stages", { era, stage_index: stageIndex });
    reset();
    backToStages();
  };

  useAndroidBack(() => {
    trackClick("press_android_back", {
      from: "result",
      era,
      stage_index: stageIndex,
    });
    reset();
    backToStages();
  });

  const handleHome = () => {
    trackClick("press_go_home", {
      from: "result",
      era,
      stage_index: stageIndex,
    });
    reset();
    goHome();
  };

  const handleRetry = () => {
    if (!era) return;
    trackClick("press_retry_stage", { era, stage_index: stageIndex });
    useGameStore.getState().startBattle(era, stageIndex);
    selectStage(stageIndex);
  };

  const handleShare = async () => {
    if (!era || !stage) return;
    const correctOnly = answers.filter((a) => a.correct).map((a) => a.question);
    const fallback = answers.map((a) => a.question);
    const pool = correctOnly.length > 0 ? correctOnly : fallback;
    trackClick("press_share_result", {
      era,
      stage_index: stageIndex,
      cleared,
      pool: correctOnly.length > 0 ? "correct" : "all",
      pool_size: pool.length,
    });
    const ok = await shareResult({
      era,
      stageLabel: stageTitle(stage),
      cleared,
      score,
      accuracy,
      pickFrom: pool,
    });
    trackClick("share_result_result", {
      era,
      stage_index: stageIndex,
      success: ok,
    });
  };

  const handleNextStage = () => {
    if (!era) return;
    const nextIdx = stageIndex + 1;
    trackClick("press_next_stage", {
      era,
      from_stage: stageIndex,
      to_stage: nextIdx,
    });
    if (nextIdx >= STAGE_DEFS.length) {
      handleBack();
      return;
    }
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
      <NotificationPromptOverlay
        visible={showNotiPrompt}
        onRegister={handleNotiRegister}
        onDismiss={handleNotiDismiss}
      />
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
          {answers.length > 0 ? (
            <Button
              size="large"
              display="full"
              variant="weak"
              color="primary"
              onClick={handleShare}
            >
              {cleared ? "🎁 친구에게 자랑하기" : "🎁 친구에게 도전장"}
            </Button>
          ) : null}
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
