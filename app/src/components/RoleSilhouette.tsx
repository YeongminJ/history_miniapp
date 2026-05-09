import type { FigureRole } from "../data/roles";
import type { BeardStyle, AccessoryType, BossVariant } from "../lib/bossVariant";

interface Props {
  role: FigureRole;
  accent: string;
  variant: BossVariant;
}

/**
 * 역사적 역할을 나타내는 실루엣.
 * 특정 인물의 초상이 아니므로 저작권 이슈 없음.
 * `variant`로 결정론적 변주 (의상색·수염·액세서리) 적용.
 */
export function RoleSilhouette({ role, accent, variant }: Props) {
  return (
    <svg
      viewBox="0 0 120 140"
      style={{
        width: "74%",
        height: "74%",
        position: "relative",
        zIndex: 2,
        filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.55))",
      }}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {role === "king" ? <King accent={accent} variant={variant} /> : null}
      {role === "general" ? <General accent={accent} variant={variant} /> : null}
      {role === "scholar" ? <Scholar accent={accent} variant={variant} /> : null}
      {role === "monk" ? <Monk accent={accent} variant={variant} /> : null}
      {role === "female" ? <Female accent={accent} variant={variant} /> : null}
      {role === "modern" ? <Modern accent={accent} variant={variant} /> : null}
      {role === "contemporary" ? (
        <Contemporary accent={accent} variant={variant} />
      ) : null}
    </svg>
  );
}

/** 수염 스타일 — 얼굴 중심 (60, 56) 기준 */
function Beard({ style }: { style: BeardStyle }) {
  if (style === "none") return null;
  if (style === "short") {
    return (
      <path
        d="M 52 62 Q 60 70 68 62"
        fill="none"
        stroke="#1B0000"
        strokeWidth="2"
        strokeLinecap="round"
      />
    );
  }
  if (style === "long") {
    return (
      <g>
        <path
          d="M 50 62 Q 60 80 70 62"
          fill="#1B0000"
          opacity="0.85"
        />
        <path
          d="M 56 76 L 56 86 M 64 76 L 64 86"
          stroke="#1B0000"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </g>
    );
  }
  // forked
  return (
    <g>
      <path d="M 50 62 Q 56 72 58 80" fill="none" stroke="#1B0000" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M 70 62 Q 64 72 62 80" fill="none" stroke="#1B0000" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

/** 우측 손 액세서리 — 어깨 옆(80, 110) 기준 */
function Accessory({
  type,
  accent,
}: {
  type: AccessoryType;
  accent: string;
}) {
  if (type === "none") return null;
  if (type === "sword") {
    return (
      <g transform="translate(96 84)">
        {/* 손잡이 */}
        <rect x="-2" y="0" width="4" height="8" fill="#3E2723" />
        {/* 가드 */}
        <rect x="-6" y="8" width="12" height="2" fill={accent} />
        {/* 칼날 */}
        <path d="M -3 10 L 0 56 L 3 10 Z" fill="#CFD8DC" stroke="#37474F" strokeWidth="0.6" />
      </g>
    );
  }
  if (type === "staff") {
    return (
      <g transform="translate(96 70)">
        {/* 지팡이 봉 */}
        <rect x="-1.2" y="0" width="2.4" height="64" fill="#5D4037" />
        {/* 윗장식 */}
        <circle cx="0" cy="-2" r="3.5" fill={accent} />
      </g>
    );
  }
  if (type === "fan") {
    return (
      <g transform="translate(92 110) rotate(20)">
        <path d="M 0 0 L -6 -22 L 6 -22 Z" fill={accent} opacity="0.85" />
        <path d="M -6 -22 L 6 -22" stroke="#1B0000" strokeWidth="0.8" />
        <path d="M 0 0 L 0 -22" stroke="#1B0000" strokeWidth="0.6" />
        <rect x="-0.6" y="0" width="1.6" height="4" fill="#1B0000" />
      </g>
    );
  }
  if (type === "scroll") {
    return (
      <g transform="translate(92 108) rotate(-15)">
        <rect x="-2" y="-14" width="14" height="4" fill="#FFF8E1" stroke="#8D6E63" strokeWidth="0.6" />
        <circle cx="-2" cy="-12" r="2.6" fill="#8D6E63" />
        <circle cx="12" cy="-12" r="2.6" fill="#8D6E63" />
      </g>
    );
  }
  if (type === "pipe") {
    return (
      <g transform="translate(94 108)">
        <rect x="-1" y="-1" width="14" height="2.4" fill="#3E2723" />
        <rect x="12" y="-3" width="4" height="6" fill="#5D4037" />
      </g>
    );
  }
  return null;
}

/* 왕: 면류관(류면) 스타일 + 곤룡포 */
function King({ accent, variant }: { accent: string; variant: BossVariant }) {
  return (
    <g>
      {/* 몸통(곤룡포) */}
      <path
        d="M 35 70 Q 60 64 85 70 L 95 138 L 25 138 Z"
        fill={variant.bodyColor}
      />
      {/* 어깨선 */}
      <path d="M 35 70 L 25 138 M 85 70 L 95 138" stroke={variant.trimColor} strokeWidth="1.2" opacity="0.5" fill="none" />
      {/* 깃 */}
      <path d="M 50 70 L 60 85 L 70 70 Z" fill={variant.trimColor} opacity="0.65" />
      {/* 얼굴 */}
      <ellipse cx="60" cy="55" rx="16" ry="18" fill="#4E342E" />
      {/* 수염 */}
      <Beard style={variant.beard} />
      {/* 면류관 바닥 */}
      <rect x="38" y="34" width="44" height="8" fill={accent} />
      {/* 면류관 상판 */}
      <rect x="32" y="28" width="56" height="8" fill={accent} />
      <rect x="32" y="28" width="56" height="3" fill="#FFF" opacity="0.45" />
      {/* 면류 (구슬 줄) */}
      {[36, 46, 56, 66, 76, 84].map((x) => (
        <g key={x}>
          <line x1={x} y1="36" x2={x} y2="44" stroke="#1B0000" strokeWidth="1" />
          <circle cx={x} cy="45" r="1.6" fill="#E91E63" />
        </g>
      ))}
      <Accessory type={variant.accessory} accent={accent} />
    </g>
  );
}

/* 장군: 투구 + 갑옷 + 어깨장식 */
function General({ accent, variant }: { accent: string; variant: BossVariant }) {
  return (
    <g>
      {/* 몸통/갑옷 */}
      <path
        d="M 30 70 Q 60 64 90 70 L 100 138 L 20 138 Z"
        fill={variant.bodyColor}
      />
      {/* 갑찰 */}
      {[78, 92, 106, 120].map((y) => (
        <path
          key={y}
          d={`M 26 ${y} Q 60 ${y - 4} 94 ${y}`}
          stroke={variant.trimColor}
          strokeWidth="1.5"
          opacity="0.55"
          fill="none"
        />
      ))}
      {/* 어깨 장식 */}
      <circle cx="30" cy="72" r="8" fill={variant.trimColor} opacity="0.85" />
      <circle cx="90" cy="72" r="8" fill={variant.trimColor} opacity="0.85" />
      {/* 얼굴 */}
      <ellipse cx="60" cy="56" rx="15" ry="17" fill="#4E342E" />
      {/* 투구 — 둥근 돔 + 얼굴가리개 */}
      <path
        d="M 42 48 Q 42 28 60 24 Q 78 28 78 48 Z"
        fill="#263238"
      />
      <path
        d="M 42 48 L 78 48 L 80 54 L 40 54 Z"
        fill={accent}
      />
      {/* 투구 장식(뿔) */}
      <path d="M 60 24 L 54 14 L 58 22 Z" fill={accent} />
      <path d="M 60 24 L 66 14 L 62 22 Z" fill={accent} />
      <circle cx="60" cy="22" r="2" fill="#E91E63" />
      {/* 수염 */}
      <Beard style={variant.beard} />
      <Accessory type={variant.accessory} accent={accent} />
    </g>
  );
}

/* 학자: 갓 + 도포 + 부채 */
function Scholar({ accent, variant }: { accent: string; variant: BossVariant }) {
  return (
    <g>
      {/* 도포 */}
      <path
        d="M 32 70 Q 60 66 88 70 L 98 138 L 22 138 Z"
        fill={variant.bodyColor}
      />
      <path d="M 32 70 L 22 138 M 88 70 L 98 138" stroke="#B0BEC5" strokeWidth="1" fill="none" />
      {/* 깃 */}
      <path d="M 50 70 L 60 82 L 70 70 Z" fill={variant.trimColor} />
      {/* 얼굴 */}
      <ellipse cx="60" cy="54" rx="14" ry="17" fill="#4E342E" />
      {/* 수염 */}
      <Beard style={variant.beard} />
      {/* 갓 — 꼭대기 + 넓은 테 */}
      <ellipse cx="60" cy="36" rx="26" ry="4" fill="#1B0000" />
      <rect x="48" y="22" width="24" height="14" fill="#1B0000" />
      <ellipse cx="60" cy="22" rx="12" ry="2.5" fill="#1B0000" />
      {/* 갓끈 */}
      <path d="M 49 36 Q 45 52 52 64" stroke="#1B0000" strokeWidth="1" fill="none" />
      <path d="M 71 36 Q 75 52 68 64" stroke="#1B0000" strokeWidth="1" fill="none" />
      <Accessory type={variant.accessory} accent={accent} />
    </g>
  );
}

/* 승려: 민머리 + 가사 + 염주 */
function Monk({ accent, variant }: { accent: string; variant: BossVariant }) {
  return (
    <g>
      {/* 가사(袈裟) */}
      <path
        d="M 32 72 Q 60 66 88 72 L 98 138 L 22 138 Z"
        fill={variant.bodyColor}
      />
      {/* 대각 가사 띠 */}
      <path
        d="M 32 82 L 95 130 L 90 138 L 28 94 Z"
        fill={variant.trimColor}
        opacity="0.55"
      />
      {/* 얼굴 */}
      <ellipse cx="60" cy="58" rx="16" ry="19" fill="#4E342E" />
      {/* 민머리 하이라이트 */}
      <ellipse cx="60" cy="46" rx="14" ry="8" fill="#6D4C41" />
      {/* 눈썹/눈 */}
      <path d="M 52 56 L 58 56 M 62 56 L 68 56" stroke="#1B0000" strokeWidth="1.5" />
      {/* 염주 */}
      <g transform="translate(60 98)">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI - Math.PI / 2;
          const x = Math.cos(a) * 16;
          const y = Math.sin(a) * 10 + 4;
          return <circle key={i} cx={x} cy={y} r="2.2" fill={accent} opacity="0.9" />;
        })}
      </g>
      <Accessory type={variant.accessory} accent={accent} />
    </g>
  );
}

/* 여성: 쪽머리 + 비녀 + 한복 */
function Female({ accent, variant }: { accent: string; variant: BossVariant }) {
  return (
    <g>
      {/* 치마 */}
      <path
        d="M 20 100 Q 60 90 100 100 L 108 138 L 12 138 Z"
        fill={variant.bodyColor}
      />
      {/* 저고리 */}
      <path
        d="M 34 72 Q 60 66 86 72 L 92 104 L 28 104 Z"
        fill="#FFF3E0"
      />
      {/* 깃 (배자) */}
      <path
        d="M 52 72 L 60 88 L 68 72 Z"
        fill={variant.trimColor}
      />
      {/* 고름 */}
      <path
        d="M 62 86 L 64 110 L 68 110 L 66 86 Z"
        fill={accent}
      />
      {/* 얼굴 */}
      <ellipse cx="60" cy="56" rx="13" ry="16" fill="#4E342E" />
      {/* 쪽머리 */}
      <path
        d="M 44 46 Q 44 24 60 24 Q 76 24 76 46 Z"
        fill="#1B0000"
      />
      <ellipse cx="60" cy="42" rx="22" ry="7" fill="#1B0000" />
      {/* 비녀 */}
      <line
        x1="38"
        y1="46"
        x2="82"
        y2="46"
        stroke={accent}
        strokeWidth="1.8"
      />
      <circle cx="38" cy="46" r="2" fill={accent} />
      <circle cx="82" cy="46" r="2" fill={accent} />
      <Accessory type={variant.accessory} accent={accent} />
    </g>
  );
}

/* 근대: 두루마기 + 중절모 OR 학생모, 콧수염 */
function Modern({ accent, variant }: { accent: string; variant: BossVariant }) {
  // 헤어/모자 변주 — bodyColor의 한자 코드 합으로 0/1/2 셋 중 결정
  const headerStyle =
    Array.from(variant.bodyColor).reduce((s, c) => s + c.charCodeAt(0), 0) % 3;
  return (
    <g>
      {/* 두루마기(흰) */}
      <path
        d="M 32 72 Q 60 66 88 72 L 98 138 L 22 138 Z"
        fill={variant.bodyColor}
      />
      <line x1="60" y1="72" x2="60" y2="138" stroke="#B0BEC5" strokeWidth="1" />
      {/* 얼굴 */}
      <ellipse cx="60" cy="56" rx="13" ry="16" fill="#4E342E" />
      {/* 콧수염 (조건부) */}
      {variant.beard !== "none" ? (
        <path
          d="M 52 60 Q 60 64 68 60"
          stroke="#1B0000"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      ) : null}
      {/* 헤어/모자 변주 */}
      {headerStyle === 0 ? (
        // 중절모
        <g>
          <rect x="46" y="28" width="28" height="16" rx="3" fill="#1B0000" />
          <rect x="38" y="42" width="44" height="4" rx="2" fill="#1B0000" />
          <rect x="46" y="38" width="28" height="3" fill={accent} opacity="0.85" />
        </g>
      ) : headerStyle === 1 ? (
        // 학생모/배지
        <g>
          <path d="M 42 44 L 78 44 L 78 38 Q 60 30 42 38 Z" fill="#1B0000" />
          <rect x="42" y="44" width="36" height="3" fill="#1B0000" />
          <circle cx="60" cy="38" r="2.4" fill={accent} />
        </g>
      ) : (
        // 단정 헤어 (모자 없음)
        <path
          d="M 47 44 Q 47 30 60 26 Q 73 30 73 44 Q 70 38 60 38 Q 50 38 47 44 Z"
          fill="#1B0000"
        />
      )}
      {/* 옷깃(넥타이 혹은 리본) */}
      <path d="M 54 72 L 60 82 L 66 72 Z" fill={variant.trimColor} opacity="0.7" />
      <Accessory type={variant.accessory} accent={accent} />
    </g>
  );
}

/* 현대: 슈트 + 깔끔한 헤어 */
function Contemporary({
  accent,
  variant,
}: {
  accent: string;
  variant: BossVariant;
}) {
  // 헤어 변주
  const hairStyle =
    Array.from(variant.bodyColor).reduce((s, c) => s + c.charCodeAt(0), 0) % 3;
  return (
    <g>
      {/* 슈트 */}
      <path
        d="M 30 74 L 60 68 L 90 74 L 100 138 L 20 138 Z"
        fill={variant.bodyColor}
      />
      {/* 셔츠 */}
      <path
        d="M 48 74 L 60 90 L 72 74 L 72 138 L 48 138 Z"
        fill={variant.trimColor}
      />
      {/* 넥타이 */}
      <path d="M 56 78 L 64 78 L 66 92 L 58 92 Z" fill={accent} />
      <path d="M 58 92 L 66 92 L 64 116 L 60 116 Z" fill={accent} />
      {/* 얼굴 */}
      <ellipse cx="60" cy="58" rx="13" ry="16" fill="#4E342E" />
      {/* 머리카락 변주 */}
      {hairStyle === 0 ? (
        // 깔끔한 단발
        <path
          d="M 47 46 Q 47 32 60 28 Q 73 32 73 46 Q 70 40 60 40 Q 50 40 47 46 Z"
          fill="#1B0000"
        />
      ) : hairStyle === 1 ? (
        // 뒤로 넘긴 머리 (가리마)
        <g>
          <path
            d="M 47 46 Q 47 32 60 28 Q 73 32 73 46 Q 68 38 60 38 Q 52 38 47 46 Z"
            fill="#1B0000"
          />
          <path d="M 60 28 L 56 46" stroke="#3E2723" strokeWidth="1" />
        </g>
      ) : (
        // 백발/회색 머리 (노년)
        <path
          d="M 47 46 Q 47 32 60 28 Q 73 32 73 46 Q 70 40 60 40 Q 50 40 47 46 Z"
          fill="#9E9E9E"
        />
      )}
      <Accessory type={variant.accessory} accent={accent} />
    </g>
  );
}
