"use client";

import { FONT_SANS, FONT_SERIF, JB } from "../core";
import { SUBSCRIPTION } from "./content";

// 購読の導線（spec §4 の⑥）。今日の紙面のすぐ下に 1 帯だけ置く。
//
// この面の主役は紙面と記事で、この帯は従。だから面ナビには入れないし、
// 記事より上にも出さない（ナビは紙面の面と読み上げだけで、売り込みは 1 つも無い）。
//
// 書くのは「読み方」で、「商品」ではない。値段もプラン名も書かない — 価格は
// 別の担当が進行中で、この面が先に数字を名乗ると片方だけ直したときに食い違う
// （奥付と同じ理由）。登録・購読・決済の画面は既存の /member が持つので、
// この帯はそこへ送るだけ。新しい面も新しい API も作らない。
//
// 送り先を 2 本とも /member にしてあるのは、いま単発の受け口がそこしか無いため。
// 単発（content-products）が実装されたら、2 本目の href だけ差し替える。
// 文言と合わせて content.ts の SUBSCRIPTION に置いてある。
export default function SubscriptionBand({ copy = SUBSCRIPTION }: { copy?: typeof SUBSCRIPTION }) {
  return (
    <section id="subscribe" className="jb-news-section">
      <div className="jb-face-head" style={{ marginBottom: "clamp(12px, 1.6vw, 18px)" }}>
        <h2
          style={{
            fontFamily: FONT_SERIF,
            fontSize: "clamp(18px, 2vw, 22px)",
            fontWeight: 700,
            margin: 0,
            color: JB.ink,
          }}
        >
          {copy.heading}
        </h2>
        <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: JB.muted }}>
          無料／会員
        </span>
      </div>

      <div className="jb-two">
        <div style={{ minWidth: 0, fontFamily: FONT_SANS, fontSize: 15, lineHeight: 2, color: JB.muted }}>
          <p style={{ margin: 0 }}>{copy.body}</p>
          <p style={{ margin: "14px 0 0", fontSize: 14 }}>
            {copy.singleNote}
          </p>
        </div>

        <div style={{ minWidth: 0, display: "flex", flexWrap: "wrap", gap: 12, alignContent: "start" }}>
          <a
            href={copy.href}
            className="jb-btn jb-btn-dark"
            style={{
              fontFamily: FONT_SANS,
              fontSize: 14,
              letterSpacing: "0.04em",
              color: JB.white,
              background: JB.ink,
              border: `1px solid ${JB.ink}`,
              padding: "13px 22px",
              minHeight: 44,
              display: "inline-flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            {copy.primaryLabel}
          </a>

          <a
            href={copy.href}
            className="jb-btn jb-btn-outline"
            style={{
              fontFamily: FONT_SANS,
              fontSize: 14,
              letterSpacing: "0.04em",
              color: JB.ink,
              background: "transparent",
              border: `1px solid ${JB.line}`,
              padding: "13px 22px",
              minHeight: 44,
              display: "inline-flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            {copy.singleLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
