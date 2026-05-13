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
import { useRedeemPoints } from "../hooks/useRedeemPoints";
import { recordPlay } from "../lib/api";
import { claimMission, getCurrentKstDate, type MissionType } from "../lib/mission";
import { isPromotionEnabled } from "../lib/promotion";
import { shareResult } from "../lib/share";
import { trackClick, trackScreen } from "../lib/track";
import { useAppStore } from "../store/useAppStore";
import { useAuthStore } from "../store/useAuthStore";
import { useGameStore } from "../store/useGameStore";
import { REDEEM_THRESHOLD, useMissionStore } from "../store/useMissionStore";
import { useNotificationStore } from "../store/useNotificationStore";
import { useProgressStore } from "../store/useProgressStore";
import { useReminderStore } from "../store/useReminderStore";

const MISSION_LABEL: Record<MissionType, string> = {
  daily_1: "오늘 첫 클리어",
  daily_3: "오늘 3판 클리어",
  daily_5: "오늘 5판 클리어",
  combo_10: "10연속 정답",
  streak_3: "3일 연속 출석",
  streak_7: "7일 연속 출석",
  streak_30: "30일 연속 출석",
};
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
  const pendingPoints = useMissionStore((s) => s.pendingPoints);
  const currentStreak = useMissionStore((s) => s.currentStreak);
  const claimedTypes = useMissionStore((s) => s.claimedTypes);
  const todayClearCount = useMissionStore((s) => s.todayClearCount);
  const incrementTodayClear = useMissionStore((s) => s.incrementTodayClear);
  const setStatus = useMissionStore((s) => s.setStatus);
  const setCurrentStreak = useMissionStore((s) => s.setCurrentStreak);
  const [claiming, setClaiming] = useState(false);
  const claimedToday = claimedTypes.includes("daily_1");
  const { redeeming, redeem: handleRedeemPoints } = useRedeemPoints("result");

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

    // cleared 시 store 의 오늘 클리어 카운트 +1 (미션 진행도용)
    if (cleared) {
      incrementTodayClear(getCurrentKstDate());
    }

    // 등록된 사용자: 클리어 시에만 서버 스트릭 갱신 → 응답의 currentStreak 동기화.
    if (notiStatus === "registered" && cleared) {
      const hash = useAuthStore.getState().hash;
      if (hash) {
        void recordPlay(hash).then((r) => {
          if (r.ok) setCurrentStreak(r.currentStreak);
        });
      }
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
    const hour = Math.floor(reminderMinute / 60);
    const minute = reminderMinute % 60;
    // 학습 알림 설정 화면과 동일한 경로로 등록. OAuth(toss appLogin) 자동 처리.
    await useReminderStore.getState().enableAt(hour, minute);
    const status = useReminderStore.getState().syncStatus;
    if (status !== "ok") {
      console.warn("[noti] reminder enable failed", status);
      setShowNotiPrompt(false);
      return;
    }
    markRegistered(reminderMinute);
    trackClick("noti_register", { reminder_minute: reminderMinute, cleared });
    if (cleared) {
      const hash = useAuthStore.getState().hash;
      if (hash) await recordPlay(hash);
    }
    setShowNotiPrompt(false);
  };

  const handleClaimMission = async () => {
    if (claiming) return;
    const hash = useAuthStore.getState().hash;
    if (!hash) return;
    setClaiming(true);
    trackClick("press_claim_mission", { era, stage_index: stageIndex });
    try {
      // 충족된 모든 미션 type 을 순차 claim
      const already = new Set(claimedTypes);
      const candidates: MissionType[] = [];
      if (!already.has("daily_1")) candidates.push("daily_1");
      if (todayClearCount >= 3 && !already.has("daily_3"))
        candidates.push("daily_3");
      if (todayClearCount >= 5 && !already.has("daily_5"))
        candidates.push("daily_5");
      if (maxCombo >= 10 && !already.has("combo_10"))
        candidates.push("combo_10");
      if (currentStreak >= 3 && !already.has("streak_3"))
        candidates.push("streak_3");
      if (currentStreak >= 7 && !already.has("streak_7"))
        candidates.push("streak_7");
      if (currentStreak >= 30 && !already.has("streak_30"))
        candidates.push("streak_30");

      let totalAwarded = 0;
      const awardedList: Array<{ type: MissionType; amount: number }> = [];
      for (const type of candidates) {
        const r = await claimMission(hash, type);
        if (!r) continue;
        // 응답으로 store 통째 갱신 (pendingPoints / claimedTypes / currentStreak)
        setStatus({
          pendingPoints: r.pendingPoints,
          currentStreak: r.currentStreak,
          claimedTypes: r.claimedTypes,
          today: r.today,
        });
        if (r.claimed && r.awardedAmount > 0) {
          totalAwarded += r.awardedAmount;
          awardedList.push({ type, amount: r.awardedAmount });
        }
      }

      trackClick("mission_claim_result", {
        types: awardedList.map((a) => a.type).join(","),
        total: totalAwarded,
      });
      if (totalAwarded > 0) {
        const breakdown = awardedList
          .map((a) => `· ${MISSION_LABEL[a.type]} +${a.amount}원`)
          .join("\n");
        window.alert(`🎉 +${totalAwarded}원 적립!\n\n${breakdown}`);
      }
    } finally {
      setClaiming(false);
    }
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

        {isPromotionEnabled() ? (
          <MissionRewardCard
            cleared={cleared}
            claimedTypes={claimedTypes}
            todayClearCount={todayClearCount}
            currentStreak={currentStreak}
            maxCombo={maxCombo}
            pendingPoints={pendingPoints}
            claiming={claiming}
            redeeming={redeeming}
            onClaim={handleClaimMission}
            onRedeem={handleRedeemPoints}
          />
        ) : null}

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
              {cleared
                ? `💪 ${score}점 자랑하기`
                : "📩 친구한테 이 문제 보내기"}
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

function MissionRewardCard({
  cleared,
  claimedTypes,
  todayClearCount,
  currentStreak,
  maxCombo,
  pendingPoints,
  claiming,
  redeeming,
  onClaim,
  onRedeem,
}: {
  cleared: boolean;
  claimedTypes: MissionType[];
  todayClearCount: number;
  currentStreak: number;
  maxCombo: number;
  pendingPoints: number;
  claiming: boolean;
  redeeming: boolean;
  onClaim: () => void;
  onRedeem: () => void;
}) {
  const ready = pendingPoints >= REDEEM_THRESHOLD;
  const progress = Math.min(pendingPoints, REDEEM_THRESHOLD);
  const already = new Set(claimedTypes);

  const eligible: { type: MissionType; label: string }[] = [];
  if (cleared && !already.has("daily_1"))
    eligible.push({ type: "daily_1", label: "오늘 첫 클리어 (+1~5원)" });
  if (cleared && todayClearCount >= 3 && !already.has("daily_3"))
    eligible.push({ type: "daily_3", label: "오늘 3판 클리어 (+2원)" });
  if (cleared && todayClearCount >= 5 && !already.has("daily_5"))
    eligible.push({ type: "daily_5", label: "오늘 5판 클리어 (+3원)" });
  if (maxCombo >= 10 && !already.has("combo_10"))
    eligible.push({ type: "combo_10", label: "10연속 정답 (+1원)" });
  if (currentStreak >= 30 && !already.has("streak_30"))
    eligible.push({ type: "streak_30", label: "30일 연속 출석 (+10원)" });
  else if (currentStreak >= 7 && !already.has("streak_7"))
    eligible.push({ type: "streak_7", label: "7일 연속 출석 (+5원)" });
  else if (currentStreak >= 3 && !already.has("streak_3"))
    eligible.push({ type: "streak_3", label: "3일 연속 출석 (+2원)" });

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1.5px solid #FFD54F",
        borderRadius: 16,
        padding: "16px 18px",
        marginBottom: 16,
        boxShadow: "0 2px 12px rgba(255, 213, 79, 0.25)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 10,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: "#5D4037" }}>
          🎯 오늘의 미션 · {todayClearCount}판 클리어
          {currentStreak > 0 ? ` · 🔥 ${currentStreak}일 연속` : ""}
        </div>
        <div style={{ fontSize: 12, color: "#8D6E63", fontWeight: 600 }}>
          누적 {progress} / {REDEEM_THRESHOLD}원
        </div>
      </div>
      <div
        style={{
          height: 6,
          background: "#FFF3E0",
          borderRadius: 999,
          overflow: "hidden",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: `${(progress / REDEEM_THRESHOLD) * 100}%`,
            height: "100%",
            background: "linear-gradient(90deg, #FFB300 0%, #FF8F00 100%)",
            transition: "width 240ms ease",
          }}
        />
      </div>
      {eligible.length === 0 ? (
        <div
          style={{
            padding: "12px",
            background: "#F5F5F5",
            color: "#9E9E9E",
            borderRadius: 10,
            textAlign: "center",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {cleared
            ? "✓ 받을 수 있는 보상 모두 받았어요"
            : "스테이지 클리어하면 보상이 열려요"}
        </div>
      ) : (
        <>
          <div
            style={{
              background: "#FFFDE7",
              borderRadius: 10,
              padding: "10px 12px",
              marginBottom: 10,
            }}
          >
            {eligible.map((e) => (
              <div
                key={e.type}
                style={{
                  fontSize: 13,
                  color: "#5D4037",
                  padding: "4px 0",
                  fontWeight: 600,
                }}
              >
                ✓ {e.label}
              </div>
            ))}
          </div>
          <button
            type="button"
            disabled={claiming}
            onClick={onClaim}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: 10,
              background: "linear-gradient(135deg, #FFB300 0%, #FF8F00 100%)",
              color: "#FFFFFF",
              fontSize: 15,
              fontWeight: 800,
              cursor: claiming ? "wait" : "pointer",
              opacity: claiming ? 0.7 : 1,
            }}
          >
            {claiming
              ? "받는 중..."
              : `🎁 보상 ${eligible.length}개 모두 받기`}
          </button>
        </>
      )}
      {ready ? (
        <button
          type="button"
          onClick={onRedeem}
          disabled={redeeming}
          style={{
            marginTop: 8,
            width: "100%",
            padding: "12px",
            border: "1.5px solid #5D4037",
            borderRadius: 10,
            background: "#FFFFFF",
            color: "#5D4037",
            fontSize: 14,
            fontWeight: 700,
            cursor: redeeming ? "wait" : "pointer",
            opacity: redeeming ? 0.7 : 1,
          }}
        >
          {redeeming
            ? "광고 준비 중..."
            : `📺 광고 보고 토스 포인트로 받기 (${pendingPoints}원)`}
        </button>
      ) : null}
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
