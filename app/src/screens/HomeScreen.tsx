import { Button, Top } from "@toss/tds-mobile";
import { useProgressStore } from "../store/useProgressStore";
import { useAppStore } from "../store/useAppStore";

export function HomeScreen() {
  const navigate = useAppStore((s) => s.navigate);
  const streak = useProgressStore((s) => s.streak);
  const totalPlayed = useProgressStore((s) => s.totalPlayed);
  const totalCorrect = useProgressStore((s) => s.totalCorrect);
  const totalScore = useProgressStore((s) => s.totalScore);

  const accuracy =
    totalPlayed > 0 ? Math.round((totalCorrect / totalPlayed) * 100) : 0;

  return (
    <div style={{ paddingBottom: 120 }}>
      <Top
        title={<Top.TitleParagraph size={28}>내가역사왕 👑</Top.TitleParagraph>}
        subtitleBottom={
          <Top.SubtitleParagraph size={17}>
            역사 속 인물을 만나 던전을 정복하세요
          </Top.SubtitleParagraph>
        }
      />

      <div style={{ padding: "8px 24px 24px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #5D4037 0%, #3E2723 100%)",
            borderRadius: 20,
            padding: 24,
            color: "#FFFFFF",
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
            연속 출석
          </div>
          <div style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.1 }}>
            🔥 {streak}일
          </div>
          <div style={{ fontSize: 13, opacity: 0.7, marginTop: 8 }}>
            오늘도 한 챕터를 정복해 보세요
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <Stat label="푼 문제" value={totalPlayed.toString()} />
          <Stat label="정답률" value={`${accuracy}%`} />
          <Stat label="누적 점수" value={totalScore.toLocaleString()} />
        </div>

        <Button
          size="xlarge"
          display="full"
          onClick={() => navigate("chapter")}
        >
          던전 입장
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "#F5F5F5",
        borderRadius: 14,
        padding: "14px 12px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 11, color: "#9E9E9E", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#212121" }}>
        {value}
      </div>
    </div>
  );
}
