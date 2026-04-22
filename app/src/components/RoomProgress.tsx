interface Props {
  total: number;
  current: number;
  accent: string;
}

export function RoomProgress({ total, current, accent }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      {Array.from({ length: total }).map((_, i) => {
        const cleared = i < current;
        const active = i === current;
        return (
          <div
            key={i}
            style={{
              width: 22,
              height: 28,
              borderRadius: "3px 3px 0 0",
              background: cleared
                ? accent
                : active
                  ? `${accent}33`
                  : "rgba(255,255,255,0.1)",
              border: `1.5px solid ${cleared || active ? accent : "rgba(255,255,255,0.25)"}`,
              position: "relative",
              boxShadow: active ? `0 0 10px ${accent}88` : undefined,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              color: cleared ? "#000" : "#FFF",
              fontWeight: 800,
            }}
          >
            {cleared ? "✔" : active ? "●" : ""}
          </div>
        );
      })}
    </div>
  );
}
