"use client";

import type { ReactNode } from "react";
import { FONT_SANS, FONT_SERIF, JB, eyebrow } from "../core";

// 運用コンソールの面（パネル）。白い紙を罫線で囲む、という紙面の作法で統一する。
export default function Panel({
  title,
  eyebrowText,
  note,
  right,
  children,
  bodyStyle,
}: {
  title: string;
  eyebrowText?: string;
  note?: string;
  right?: ReactNode;
  children: ReactNode;
  bodyStyle?: React.CSSProperties;
}) {
  return (
    <section
      style={{
        background: JB.white,
        border: `1px solid ${JB.line}`,
        boxSizing: "border-box",
      }}
    >
      <header
        className="jb-panel-pad"
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          padding: "16px clamp(12px, 2vw, 22px)",
          borderBottom: `1px solid ${JB.ink}`,
        }}
      >
        <div style={{ minWidth: 0 }}>
          {eyebrowText && <div style={eyebrow(JB.accent)}>{eyebrowText}</div>}
          <h2
            style={{
              fontFamily: FONT_SERIF,
              fontSize: "clamp(17px, 1.6vw, 19px)",
              fontWeight: 600,
              color: JB.ink,
              margin: eyebrowText ? "7px 0 0" : 0,
              lineHeight: 1.4,
            }}
          >
            {title}
          </h2>
        </div>
        {right}
      </header>

      <div className="jb-panel-pad" style={{ padding: "clamp(12px, 2vw, 22px)", ...bodyStyle }}>{children}</div>

      {note && (
        <div
          style={{
            borderTop: `1px solid ${JB.line}`,
            padding: "10px clamp(16px, 2vw, 22px)",
            fontFamily: FONT_SANS,
            fontSize: 11.5,
            lineHeight: 1.8,
            color: JB.muted,
          }}
        >
          {note}
        </div>
      )}
    </section>
  );
}
