"use client";

import { FONT_SANS, JB } from "../core";

// 記事が無いとき／取得できないときに出す 1 行。
// 見出しだけの骸骨を並べない（spec §4 の「空の枠を出さない」）。
export default function NewsEmpty({ reason }: { reason: "empty" | "error" }) {
  return (
    <p
      style={{
        fontFamily: FONT_SANS,
        fontSize: 15,
        lineHeight: 2,
        color: JB.muted,
        border: `1px solid ${JB.line}`,
        background: JB.white,
        padding: "18px 20px",
        margin: 0,
      }}
    >
      {reason === "error"
        ? "紙面データに接続できませんでした。時間をおいて開き直してください。"
        : "本日の記事はまだ配信されていません。"}
    </p>
  );
}
