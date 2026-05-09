import { motion } from "framer-motion";

export type CharacterStyle = "emoji" | "svg" | "big";

/* =============================================
 * 스타일 1: 기본 이모지 (Original)
 * ============================================= */

export function EmojiPlayer() {
  return (
    <motion.div
      animate={{
        y: [0, -6, 0, -3.6, 0],
        rotate: [-3, 3, -1.8, 1.8, -3],
      }}
      transition={{ duration: 0.36, repeat: Infinity, ease: "easeInOut" }}
      style={{
        fontSize: 52,
        lineHeight: 1,
        filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))",
      }}
    >
      🏃
    </motion.div>
  );
}

export function EmojiTiger() {
  return (
    <motion.div
      animate={{
        y: [0, -4, 0, -2.4, 0],
        rotate: [-4, 4, -2.4, 2.4, -4],
      }}
      transition={{ duration: 0.42, repeat: Infinity, ease: "easeInOut" }}
      style={{
        fontSize: 56,
        lineHeight: 1,
        filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))",
      }}
    >
      🐯
    </motion.div>
  );
}

/* =============================================
 * 스타일 2: 한국풍 SVG (custom)
 * 갓 쓴 한복 인물 + 한국 호랑이 (王 글자), 팔/다리 애니메이션
 * ============================================= */

export function SvgPlayer() {
  const armDuration = 0.42;
  const legDuration = 0.42;

  return (
    <svg
      width="80"
      height="100"
      viewBox="0 0 80 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{
        filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.55))",
        overflow: "visible",
      }}
    >
      {/* 뒤쪽 팔 */}
      <motion.g
        animate={{ rotate: [38, -42, 38] }}
        transition={{ duration: armDuration, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "30px 38px" }}
      >
        <rect x="27.5" y="38" width="5" height="20" rx="2.5" fill="#E8DFC7" />
        <circle cx="30" cy="60" r="2.5" fill="#D7B299" />
      </motion.g>

      {/* 뒤쪽 다리 */}
      <motion.g
        animate={{ rotate: [-30, 32, -30] }}
        transition={{ duration: legDuration, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "37px 70px" }}
      >
        <rect x="34" y="70" width="6" height="22" rx="2.5" fill="#FAFAFA" />
        <ellipse cx="37" cy="93" rx="5" ry="2.4" fill="#1B0000" />
      </motion.g>

      {/* 도포 */}
      <path d="M 28 36 Q 40 33 52 36 L 56 76 L 24 76 Z" fill="#FAFAFA" stroke="#9E9E9E" strokeWidth="0.6" />
      <line x1="40" y1="36" x2="40" y2="76" stroke="#CFCFCF" strokeWidth="0.7" />
      <path d="M 35 36 L 40 48 L 45 36 Z" fill="#1A237E" />
      <path d="M 41 47 L 42 60 L 44 60 L 43 47 Z" fill="#E91E63" />

      {/* 얼굴 */}
      <ellipse cx="40" cy="26" rx="8.5" ry="9.5" fill="#D7B299" />
      <path d="M 32 27 Q 32 22 40 22 Q 48 22 48 27 Q 46 25 40 25 Q 34 25 32 27 Z" fill="#1B0000" />
      <line x1="36" y1="27" x2="38" y2="27" stroke="#1B0000" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="42" y1="27" x2="44" y2="27" stroke="#1B0000" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="38" y1="32" x2="42" y2="32" stroke="#1B0000" strokeWidth="0.8" strokeLinecap="round" />

      {/* 갓 */}
      <ellipse cx="40" cy="16" rx="22" ry="3" fill="#1B0000" />
      <rect x="32" y="6" width="16" height="11" rx="1" fill="#1B0000" />
      <ellipse cx="40" cy="6" rx="8" ry="2" fill="#1B0000" />
      <ellipse cx="40" cy="6" rx="8" ry="1.6" fill="#3E2723" />
      <path d="M 31 16 Q 30 22 33 28" stroke="#1B0000" strokeWidth="0.7" fill="none" />
      <path d="M 49 16 Q 50 22 47 28" stroke="#1B0000" strokeWidth="0.7" fill="none" />

      {/* 앞쪽 팔 */}
      <motion.g
        animate={{ rotate: [-42, 38, -42] }}
        transition={{ duration: armDuration, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50px 38px" }}
      >
        <rect x="47.5" y="38" width="5" height="20" rx="2.5" fill="#FAFAFA" />
        <circle cx="50" cy="60" r="2.7" fill="#D7B299" />
      </motion.g>

      {/* 앞쪽 다리 */}
      <motion.g
        animate={{ rotate: [32, -30, 32] }}
        transition={{ duration: legDuration, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "43px 70px" }}
      >
        <rect x="40" y="70" width="6" height="22" rx="2.5" fill="#FAFAFA" />
        <ellipse cx="43" cy="93" rx="5" ry="2.4" fill="#1B0000" />
      </motion.g>
    </svg>
  );
}

export function SvgTiger() {
  const galDuration = 0.36;
  const tailDuration = 0.6;

  return (
    <svg
      width="120"
      height="84"
      viewBox="0 0 140 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{
        filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.55))",
        overflow: "visible",
      }}
    >
      {/* 꼬리 */}
      <motion.g
        animate={{ rotate: [-12, 18, -12] }}
        transition={{ duration: tailDuration, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "20px 50px" }}
      >
        <path
          d="M 22 50 Q 4 38 0 22 Q 6 26 12 30 Q 16 38 22 50 Z"
          fill="#F57C00"
          stroke="#5D2C00"
          strokeWidth="0.8"
        />
        <ellipse cx="2" cy="22" rx="3" ry="2.5" fill="#1B0000" />
        <line x1="8" y1="28" x2="12" y2="34" stroke="#1B0000" strokeWidth="1.2" />
        <line x1="14" y1="36" x2="18" y2="42" stroke="#1B0000" strokeWidth="1.2" />
      </motion.g>

      {/* 뒷다리 (뒤쪽) */}
      <motion.g
        animate={{ rotate: [-35, 25, -35] }}
        transition={{ duration: galDuration, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "40px 70px" }}
      >
        <path
          d="M 34 60 Q 36 80 32 92 Q 38 92 42 88 Q 44 78 40 60 Z"
          fill="#F57C00"
          stroke="#5D2C00"
          strokeWidth="0.8"
        />
        <ellipse cx="36" cy="93" rx="5" ry="2.5" fill="#1B0000" />
      </motion.g>

      {/* 앞다리 (뒤쪽) */}
      <motion.g
        animate={{ rotate: [25, -35, 25] }}
        transition={{ duration: galDuration, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "92px 60px" }}
      >
        <path
          d="M 88 50 Q 90 70 86 88 Q 92 90 96 86 Q 98 72 94 50 Z"
          fill="#F57C00"
          stroke="#5D2C00"
          strokeWidth="0.8"
        />
        <ellipse cx="91" cy="89" rx="5" ry="2.5" fill="#1B0000" />
      </motion.g>

      {/* 몸통 */}
      <path
        d="M 22 48 Q 30 30 60 30 Q 95 30 110 38 Q 118 42 118 52 Q 118 62 105 65 Q 80 68 60 65 Q 38 64 22 56 Z"
        fill="#F57C00"
        stroke="#5D2C00"
        strokeWidth="1"
      />
      <path d="M 30 58 Q 60 64 90 60 Q 90 66 80 68 Q 60 70 35 64 Z" fill="#FFF8E1" />
      <path d="M 36 36 Q 40 42 38 50" stroke="#1B0000" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 50 32 Q 53 42 50 52" stroke="#1B0000" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 65 32 Q 68 42 66 54" stroke="#1B0000" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M 80 32 Q 84 42 82 54" stroke="#1B0000" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M 95 34 Q 98 44 96 54" stroke="#1B0000" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 108 38 Q 112 46 110 54" stroke="#1B0000" strokeWidth="1.6" fill="none" strokeLinecap="round" />

      {/* 머리 */}
      <ellipse cx="118" cy="36" rx="20" ry="18" fill="#F57C00" stroke="#5D2C00" strokeWidth="1" />
      <ellipse cx="124" cy="44" rx="11" ry="7" fill="#FFF8E1" />
      <path d="M 108 26 Q 112 32 110 38" stroke="#1B0000" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M 118 22 Q 120 28 118 34" stroke="#1B0000" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M 128 22 Q 128 30 124 35" stroke="#1B0000" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M 134 28 Q 134 36 130 40" stroke="#1B0000" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <text x="118" y="32" fontSize="9" fontWeight="900" fill="#1B0000" textAnchor="middle" fontFamily="serif">王</text>
      <path d="M 105 22 Q 100 12 110 14 L 112 22 Z" fill="#F57C00" stroke="#5D2C00" strokeWidth="0.8" />
      <path d="M 130 22 Q 134 12 124 14 L 122 22 Z" fill="#F57C00" stroke="#5D2C00" strokeWidth="0.8" />
      <ellipse cx="106" cy="18" rx="2" ry="2.5" fill="#FFB199" />
      <ellipse cx="129" cy="18" rx="2" ry="2.5" fill="#FFB199" />
      <ellipse cx="115" cy="34" rx="2.4" ry="2.8" fill="#FFEB3B" />
      <ellipse cx="115" cy="34" rx="1" ry="2" fill="#1B0000" />
      <ellipse cx="125" cy="34" rx="2.4" ry="2.8" fill="#FFEB3B" />
      <ellipse cx="125" cy="34" rx="1" ry="2" fill="#1B0000" />
      <path d="M 119 41 L 122 41 L 120.5 44 Z" fill="#1B0000" />
      <path
        d="M 116 47 Q 120 52 124 47 L 124 49 Q 120 53 116 49 Z"
        fill="#7B1818"
        stroke="#1B0000"
        strokeWidth="0.6"
      />
      <polygon points="117,47 118,51 119,47" fill="#FFFFFF" stroke="#1B0000" strokeWidth="0.4" />
      <polygon points="121,47 122,51 123,47" fill="#FFFFFF" stroke="#1B0000" strokeWidth="0.4" />
      <line x1="110" y1="44" x2="100" y2="42" stroke="#1B0000" strokeWidth="0.6" />
      <line x1="110" y1="46" x2="100" y2="48" stroke="#1B0000" strokeWidth="0.6" />
      <line x1="130" y1="44" x2="140" y2="42" stroke="#1B0000" strokeWidth="0.6" />
      <line x1="130" y1="46" x2="140" y2="48" stroke="#1B0000" strokeWidth="0.6" />

      {/* 앞쪽 다리 짝 (반대 위상) */}
      <motion.g
        animate={{ rotate: [-30, 35, -30] }}
        transition={{ duration: galDuration, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "100px 60px" }}
      >
        <path
          d="M 96 50 Q 98 70 94 88 Q 100 90 104 86 Q 106 72 102 50 Z"
          fill="#F57C00"
          stroke="#5D2C00"
          strokeWidth="0.8"
        />
        <ellipse cx="99" cy="89" rx="5" ry="2.5" fill="#1B0000" />
      </motion.g>
      <motion.g
        animate={{ rotate: [30, -30, 30] }}
        transition={{ duration: galDuration, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "48px 70px" }}
      >
        <path
          d="M 42 60 Q 44 80 40 92 Q 46 92 50 88 Q 52 78 48 60 Z"
          fill="#F57C00"
          stroke="#5D2C00"
          strokeWidth="0.8"
        />
        <ellipse cx="44" cy="93" rx="5" ry="2.5" fill="#1B0000" />
      </motion.g>
    </svg>
  );
}

/* =============================================
 * 스타일 3: 빅 이모지 (3D-style polish)
 * 큰 사이즈 + 글로우 + 먼지 트레일 + 다른 이모지 변종
 * ============================================= */

export function BigPlayer() {
  return (
    <div style={{ position: "relative" }}>
      {/* 먼지 트레일 */}
      <motion.div
        animate={{ opacity: [0.7, 0, 0.7] }}
        transition={{ duration: 0.4, repeat: Infinity }}
        style={{
          position: "absolute",
          right: 30,
          bottom: -2,
          width: 30,
          height: 16,
          background:
            "radial-gradient(ellipse at 100% 50%, rgba(255,255,255,0.55) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        animate={{
          y: [0, -8, 0, -4.8, 0],
          rotate: [-4, 4, -2.4, 2.4, -4],
          scale: [1, 1.04, 1],
        }}
        transition={{ duration: 0.34, repeat: Infinity, ease: "easeInOut" }}
        style={{
          fontSize: 78,
          lineHeight: 1,
          filter:
            "drop-shadow(0 0 14px rgba(33,150,243,0.55)) drop-shadow(0 6px 8px rgba(0,0,0,0.6))",
        }}
      >
        🏃‍♂️
      </motion.div>
    </div>
  );
}

export function BigTiger() {
  return (
    <div style={{ position: "relative" }}>
      {/* 분노 글로우 */}
      <motion.div
        animate={{ opacity: [0.4, 0.85, 0.4] }}
        transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: -8,
          background:
            "radial-gradient(circle, rgba(229,57,53,0.55) 0%, transparent 60%)",
          borderRadius: "50%",
          pointerEvents: "none",
          filter: "blur(2px)",
        }}
      />
      <motion.div
        animate={{
          y: [0, -5, 0, -3, 0],
          rotate: [-5, 5, -3, 3, -5],
          scale: [1, 1.06, 1],
        }}
        transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          fontSize: 80,
          lineHeight: 1,
          filter:
            "drop-shadow(0 0 14px rgba(229,57,53,0.7)) drop-shadow(0 6px 8px rgba(0,0,0,0.6))",
          position: "relative",
        }}
      >
        🐅
      </motion.div>
    </div>
  );
}

/* =============================================
 * Style picker — 단일 진입점
 * ============================================= */

export function PlayerByStyle({ style }: { style: CharacterStyle }) {
  if (style === "svg") return <SvgPlayer />;
  if (style === "big") return <BigPlayer />;
  return <EmojiPlayer />;
}

export function TigerByStyle({ style }: { style: CharacterStyle }) {
  if (style === "svg") return <SvgTiger />;
  if (style === "big") return <BigTiger />;
  return <EmojiTiger />;
}

/** UI 표시용 스타일 메타. */
export const CHARACTER_STYLE_META: Record<
  CharacterStyle,
  { label: string; description: string }
> = {
  emoji: { label: "이모지", description: "기본. 단순·가벼움" },
  svg: { label: "한국풍", description: "갓+한복 인물 / 호랑이 (王)" },
  big: { label: "빅 이모지", description: "큰 크기 + 글로우 + 먼지" },
};
