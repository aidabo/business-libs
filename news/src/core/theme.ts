import type { CSSProperties } from "react";

// 新聞の画面（読者面と編集局）で共有するデザイントークン。
// 紙と活字の質感 — 罫線はヘアライン、角丸は使わない、色は紙・墨・朱に絞る。
// /home/news と /dashboard/news の両方がここを参照する。
export const JB = {
  /** 墨（見出し・本文の基本色） */
  ink: "#12100e",
  inkSoft: "#1c1a17",
  /** 紙 */
  paper: "#f7f4ee",
  paperDeep: "#efe9dd",
  white: "#ffffff",
  /** 罫線 */
  line: "#ddd5c6",
  lineDark: "#2a2723",
  /** 朱（アクセント。飾り罫・番号・強調にのみ使う） */
  accent: "#b5121b",
  /** 深藍（状態表示・リンク） */
  navy: "#1f3a5f",
  /** 補助文字 */
  muted: "#6b6459",
  /** 暗い帯の上の補助文字 */
  mutedOnDark: "#a89f8d",
} as const;

export const FONT_SERIF =
  '"Noto Serif JP","Yu Mincho","YuMincho","Hiragino Mincho ProN","Times New Roman",serif';
export const FONT_SANS =
  '"Noto Sans JP","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",system-ui,sans-serif';
export const FONT_MONO =
  'ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace';

/** 版面の幅と左右余白（PaperStyles で定義）。セクションの中身はこれで包む。 */
export const WRAP = "jb-wrap";

/** 英字の小ラベル（字間を広げた大文字）。面名・セクション名に使う。 */
export const eyebrow = (color: string = JB.muted): CSSProperties => ({
  fontFamily: FONT_SANS,
  fontSize: 11,
  lineHeight: 1.4,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color,
});

/** 見出し（明朝）。 */
export const heading = (size: number, color: string = JB.ink): CSSProperties => ({
  fontFamily: FONT_SERIF,
  fontSize: size,
  lineHeight: 1.35,
  letterSpacing: "0.01em",
  fontWeight: 600,
  color,
});

/** 本文。 */
export const body = (size = 14, color: string = JB.inkSoft): CSSProperties => ({
  fontFamily: FONT_SANS,
  fontSize: size,
  lineHeight: 1.9,
  color,
});

/** 朱の飾り罫。「.jb-rule」を付けると左から伸びる。 */
export const accentRule: CSSProperties = {
  width: 32,
  height: 3,
  backgroundColor: JB.accent,
  border: "none",
};

/** セクションの上下余白（狭い画面では自動的に詰まる）。 */
export const sectionY: CSSProperties = {
  paddingTop: "clamp(56px, 7vw, 104px)",
  paddingBottom: "clamp(56px, 7vw, 104px)",
};
