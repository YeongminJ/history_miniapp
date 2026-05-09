import { motion } from "framer-motion";
import { ERA_THEME } from "../data/bosses";
import { roleOf } from "../data/roles";
import { getBossVariant } from "../lib/bossVariant";
import { EraBackdrop } from "./EraBackdrop";
import { RoleSilhouette } from "./RoleSilhouette";
import type { Era } from "../types";

interface Props {
  era: Era;
  name: string;
  hitKey?: number;
  missKey?: number;
  critical?: boolean;
}

export function EnemyScene({
  era,
  name,
  hitKey = 0,
  missKey = 0,
  critical = false,
}: Props) {
  const theme = ERA_THEME[era];
  const role = roleOf(era, name);
  const variant = getBossVariant(name, role);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      {/* 이름 배너 */}
      <div
        style={{
          position: "relative",
          padding: "4px 14px",
          background: theme.nameBg,
          border: `1.5px solid ${theme.frameBorder}`,
          borderRadius: 18,
          color: theme.accent,
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 1,
          boxShadow: `0 0 14px ${theme.frameGlow}`,
        }}
      >
        ✦ {name} ✦
      </div>

      {/* 초상 프레임 */}
      <motion.div
        key={`${hitKey}-${missKey}`}
        animate={{
          y: missKey ? [0, -4, 2, -3, 0] : 0,
          x: missKey ? [0, -10, 10, -6, 6, 0] : 0,
          scale: hitKey ? [1, 0.88, 1.06, 1] : 1,
          rotate: hitKey ? [0, -8, 8, 0] : 0,
        }}
        transition={{ duration: 0.5 }}
        style={{
          position: "relative",
          width: 104,
          height: 104,
          borderRadius: "50%",
          background: `radial-gradient(circle at 30% 30%, ${theme.nameBg} 0%, #000 90%)`,
          border: `2.5px solid ${theme.frameBorder}`,
          boxShadow: `0 0 22px ${theme.frameGlow}, inset 0 0 16px rgba(0,0,0,0.6)`,
          overflow: "hidden",
        }}
      >
        {/* 시대 배경 풍경 */}
        <EraBackdrop era={era} accent={theme.accent} />

        {/* 캐릭터 실루엣 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: 4,
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.04, 1], y: [0, -2, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <RoleSilhouette role={role} accent={theme.accent} variant={variant} />
          </motion.div>
        </div>

        {/* 이름 첫 글자 배지 — 같은 role/변주여도 보스별로 명확히 구분 */}
        <div
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: theme.nameBg,
            border: `1.5px solid ${theme.frameBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.accent,
            fontSize: 14,
            fontWeight: 900,
            zIndex: 4,
            boxShadow: `0 0 8px ${theme.frameGlow}`,
            letterSpacing: 0,
          }}
        >
          {name.slice(0, 1)}
        </div>

        {/* 크리티컬 후광 */}
        {critical ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 1, 0], scale: [0.6, 1.4, 1.6] }}
            transition={{ duration: 0.8 }}
            style={{
              position: "absolute",
              inset: -10,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,255,0,0.7) 0%, transparent 70%)",
              pointerEvents: "none",
              zIndex: 3,
            }}
          />
        ) : null}
      </motion.div>
    </div>
  );
}
