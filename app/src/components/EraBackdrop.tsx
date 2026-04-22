import type { Era } from "../types";

interface Props {
  era: Era;
  accent: string;
}

/**
 * 적 초상 뒤에 깔리는 시대별 풍경 SVG.
 * 전부 원저작 실루엣으로 저작권 이슈 없음.
 */
export function EraBackdrop({ era, accent }: Props) {
  return (
    <svg
      viewBox="0 0 300 200"
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: 0.75,
      }}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`sky-${era}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill={`url(#sky-${era})`} />
      {era === "고대" ? <AncientScene accent={accent} /> : null}
      {era === "고려" ? <GoryeoScene accent={accent} /> : null}
      {era === "조선" ? <JoseonScene accent={accent} /> : null}
      {era === "근대" ? <ModernScene accent={accent} /> : null}
      {era === "현대" ? <ContemporaryScene accent={accent} /> : null}
    </svg>
  );
}

/* 고대: 산 + 고분 + 소나무 */
function AncientScene({ accent }: { accent: string }) {
  return (
    <g opacity="0.9">
      {/* 산 */}
      <path
        d="M -10 170 L 60 100 L 110 140 L 170 80 L 240 140 L 310 110 L 310 200 L -10 200 Z"
        fill="#000"
        opacity="0.55"
      />
      {/* 고분 */}
      <ellipse cx="150" cy="170" rx="55" ry="22" fill="#000" opacity="0.7" />
      <ellipse cx="150" cy="168" rx="55" ry="12" fill={accent} opacity="0.15" />
      {/* 소나무 실루엣 */}
      <g fill="#000" opacity="0.7">
        <rect x="58" y="155" width="3" height="20" />
        <path d="M 50 155 Q 60 138 70 155 Q 60 148 50 155 Z" />
        <rect x="250" y="150" width="3" height="25" />
        <path d="M 240 150 Q 252 130 264 150 Q 252 143 240 150 Z" />
      </g>
    </g>
  );
}

/* 고려: 팔작지붕 궁궐 */
function GoryeoScene({ accent }: { accent: string }) {
  return (
    <g opacity="0.85">
      {/* 뒷배경 산 */}
      <path
        d="M -10 160 L 80 100 L 160 130 L 230 90 L 310 140 L 310 200 L -10 200 Z"
        fill="#000"
        opacity="0.45"
      />
      {/* 팔작지붕 궁 */}
      <g transform="translate(150 150)">
        {/* 지붕 곡선 */}
        <path
          d="M -80 0 Q -80 -14 -70 -14 L -50 -34 Q -50 -42 -30 -42 L 30 -42 Q 50 -42 50 -34 L 70 -14 Q 80 -14 80 0 Z"
          fill="#000"
          opacity="0.8"
          stroke={accent}
          strokeWidth="1"
          strokeOpacity="0.35"
        />
        {/* 지붕선 하이라이트 */}
        <path
          d="M -70 -14 L 70 -14"
          stroke={accent}
          strokeWidth="1.5"
          strokeOpacity="0.45"
          fill="none"
        />
        {/* 기둥 */}
        <rect x="-40" y="0" width="3" height="30" fill="#000" opacity="0.85" />
        <rect x="-12" y="0" width="3" height="30" fill="#000" opacity="0.85" />
        <rect x="10" y="0" width="3" height="30" fill="#000" opacity="0.85" />
        <rect x="37" y="0" width="3" height="30" fill="#000" opacity="0.85" />
        {/* 단 */}
        <rect x="-80" y="30" width="160" height="6" fill="#000" opacity="0.7" />
      </g>
    </g>
  );
}

/* 조선: 근정전 + 좌우 회랑 + 달 */
function JoseonScene({ accent }: { accent: string }) {
  return (
    <g opacity="0.85">
      {/* 달 */}
      <circle cx="240" cy="50" r="22" fill={accent} opacity="0.22" />
      <circle cx="240" cy="50" r="14" fill={accent} opacity="0.4" />
      {/* 산 */}
      <path
        d="M -10 150 L 80 80 L 170 130 L 250 90 L 310 130 L 310 200 L -10 200 Z"
        fill="#000"
        opacity="0.5"
      />
      {/* 2단 근정전 */}
      <g transform="translate(150 155)">
        {/* 윗 지붕 */}
        <path
          d="M -60 -46 Q -60 -56 -50 -56 L -30 -68 L 30 -68 L 50 -56 Q 60 -56 60 -46 Z"
          fill="#000"
          opacity="0.8"
        />
        <line
          x1="-50"
          y1="-56"
          x2="50"
          y2="-56"
          stroke={accent}
          strokeOpacity="0.5"
          strokeWidth="1.4"
        />
        {/* 몸통 */}
        <rect x="-50" y="-46" width="100" height="20" fill="#000" opacity="0.88" />
        {/* 아래 지붕 */}
        <path
          d="M -85 -26 Q -85 -34 -75 -34 L 75 -34 Q 85 -34 85 -26 L 75 -16 Q 75 -10 60 -10 L -60 -10 Q -75 -10 -75 -16 Z"
          fill="#000"
          opacity="0.85"
        />
        <line
          x1="-75"
          y1="-34"
          x2="75"
          y2="-34"
          stroke={accent}
          strokeOpacity="0.55"
          strokeWidth="1.4"
        />
        {/* 기둥 */}
        {[-60, -36, -12, 12, 36, 60].map((x) => (
          <rect key={x} x={x - 1.5} y="-10" width="3" height="34" fill="#000" opacity="0.85" />
        ))}
        {/* 단 */}
        <rect x="-95" y="24" width="190" height="8" fill="#000" opacity="0.7" />
      </g>
    </g>
  );
}

/* 근대: 항구 + 증기선 + 서양식 건물 */
function ModernScene({ accent }: { accent: string }) {
  return (
    <g opacity="0.9">
      {/* 하늘 */}
      <rect y="0" width="300" height="130" fill="#000" opacity="0.15" />
      {/* 산/언덕 */}
      <path
        d="M -10 130 Q 60 100 140 122 Q 220 95 310 118 L 310 200 L -10 200 Z"
        fill="#000"
        opacity="0.55"
      />
      {/* 서양식 건물 (아치형 창) */}
      <g transform="translate(55 125)" fill="#000" opacity="0.85">
        <rect x="-20" y="-30" width="40" height="36" />
        <path d="M -22 -30 L 0 -45 L 22 -30 Z" />
        <rect x="-12" y="-20" width="8" height="14" fill={accent} opacity="0.25" />
        <rect x="4" y="-20" width="8" height="14" fill={accent} opacity="0.25" />
      </g>
      {/* 증기선 + 연기 */}
      <g transform="translate(210 135)">
        <path
          d="M -36 6 Q -30 16 -14 16 L 14 16 Q 30 16 36 6 L 40 0 L -40 0 Z"
          fill="#000"
          opacity="0.85"
        />
        <rect x="-18" y="-14" width="30" height="14" fill="#000" opacity="0.85" />
        <rect x="-4" y="-30" width="6" height="16" fill="#000" opacity="0.85" />
        {/* 연기 */}
        <g fill={accent} opacity="0.3">
          <circle cx="1" cy="-36" r="6" />
          <circle cx="6" cy="-46" r="8" />
          <circle cx="-2" cy="-54" r="10" />
        </g>
      </g>
      {/* 물결 */}
      <path
        d="M -10 180 Q 10 174 30 180 T 70 180 T 110 180 T 150 180 T 190 180 T 230 180 T 270 180 T 310 180 L 310 200 L -10 200 Z"
        fill="#000"
        opacity="0.55"
      />
    </g>
  );
}

/* 현대: 도시 스카이라인 + 창문 불빛 */
function ContemporaryScene({ accent }: { accent: string }) {
  const buildings = [
    { x: 0, w: 38, h: 70 },
    { x: 40, w: 30, h: 90 },
    { x: 72, w: 44, h: 60 },
    { x: 118, w: 36, h: 110 },
    { x: 156, w: 34, h: 80 },
    { x: 192, w: 40, h: 100 },
    { x: 234, w: 30, h: 70 },
    { x: 266, w: 40, h: 85 },
  ];
  return (
    <g opacity="0.92">
      <rect y="0" width="300" height="200" fill="#000" opacity="0.1" />
      {buildings.map((b, i) => (
        <g key={i}>
          <rect
            x={b.x}
            y={200 - b.h - 4}
            width={b.w}
            height={b.h}
            fill="#000"
            opacity="0.85"
          />
          {/* 창문 불빛 */}
          {Array.from({ length: Math.floor(b.h / 10) }).map((_, row) =>
            Array.from({ length: Math.floor(b.w / 8) }).map((__, col) => {
              const lit = (i + row + col) % 3 !== 0;
              if (!lit) return null;
              return (
                <rect
                  key={`${row}-${col}`}
                  x={b.x + col * 8 + 2}
                  y={200 - b.h - 4 + row * 10 + 3}
                  width="3"
                  height="4"
                  fill={accent}
                  opacity={0.6}
                />
              );
            }),
          )}
        </g>
      ))}
      <rect y="196" width="300" height="4" fill="#000" opacity="0.9" />
    </g>
  );
}
