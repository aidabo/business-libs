"use client";

import { CSSProperties } from "react";
import { FONT_SANS, FONT_SERIF, JB } from "../core";
import { usePaperSettings } from "./PaperSettingsContext";
import usePaperDate, { usePaperEdition } from "./usePaperDate";

// 紙面のモック。外部素材（PDF・画像）に依存せず、HTML/CSS だけで新聞の1面を描く。
// → 素材が無くてもデモが成立する。実紙面の画像が用意できたら `imageUrl` を渡せば
//   写真枠がその画像に差し替わる（紙面全体の画像を貼る場合は `fullImageUrl`）。
//
// 寸法はすべて em。`scale` で紙面全体を拡大縮小できるほか、`fluid` を付けると
// 親要素の幅に比例して文字サイズが自動で決まる（狭い画面でも間延びしない）。
export type PaperMockProps = {
  /** 発行日（紙面の左肩）。省略すると今日の日付になる。 */
  date?: string;
  /** 号数（紙面の右肩）。省略すると今日の号になる。 */
  edition?: string;
  /** 一面トップの見出し */
  headline?: string;
  /** 見出し下のリード */
  subheadline?: string;
  /** 写真枠に流し込む画像 URL。未指定なら枠だけを描く。 */
  imageUrl?: string;
  /** 紙面全体の画像 URL。指定すると紙面を描かず画像を表示する。 */
  fullImageUrl?: string;
  /** 拡大率（fluid のときは無視される）。1 で約 420px 幅相当。 */
  scale?: number;
  /** 親の幅に比例して文字サイズを決める。 */
  fluid?: boolean;
  /** 紙面を読み取るスキャンの帯を流す（モーション）。 */
  animate?: boolean;
  /** 隅に「サンプル」バッジを出す（デモ用であることを示す）。 */
  showSampleBadge?: boolean;
  className?: string;
  style?: CSSProperties;
};

// 本文の代わりに引く罫線。日本語の段組みらしく見えるよう、行間 0.7em で細い線を並べる。
function TextLines({ lines, width = "100%" }: { lines: number; width?: string }) {
  return (
    <div
      aria-hidden
      style={{
        width,
        height: `${lines * 0.7}em`,
        backgroundImage:
          "repeating-linear-gradient(to bottom, #cdc4b1 0 0.5px, transparent 0.5px 0.7em)",
      }}
    />
  );
}

export default function PaperMock({
  date,
  edition,
  headline = "地域の紙面を、そのままデジタルへ",
  subheadline = "紙面電子版と記事データを同じ基盤で配信",
  imageUrl,
  fullImageUrl,
  scale = 1,
  fluid = false,
  animate = false,
  showSampleBadge = true,
  className,
  style,
}: PaperMockProps) {
  // 日付は「今日」。サーバーでは確定できないので、マウント後に埋める
  // （確定前に描くと、サーバーとクライアントで日付がずれる）。
  // 早期 return より前に呼ぶこと（フックの順序を変えないため）。
  const today = usePaperDate();
  const dateText = date ?? today;
  const todayEdition = usePaperEdition();
  const editionText = edition ?? todayEdition ?? "";
  const { paperName } = usePaperSettings();

  // 紙面モックは「紙面の絵」。中の文字（広告・罫線・見出し）は 6px 相当まで縮むので
  // 読ませるためのものではない。AT には 1 枚の絵として渡し、見出しだけを名前にする。
  // これを外すと、縮んだ「広告」の 2 文字まで読み上げられ、細かい文字が本文として
  // 数えられる（可読性の規約に対して誤検知になる）。
  const paperAlt = [headline, subheadline].filter(Boolean).join("／");
  const paperLabel = `紙面イメージ：${paperAlt}`;

  if (fullImageUrl) {
    return (
      <img
        src={fullImageUrl}
        alt={paperLabel}
        className={className}
        style={{ width: "100%", display: "block", border: `1px solid ${JB.line}`, ...style }}
      />
    );
  }

  const hair = `1px solid ${JB.line}`;

  const sheet = (
    <div
      // 中の文字は絵の一部。role="img" を外側に付けても Chrome は子を読み上げるので、
      // こちら側で明示的に落とす（実測: CDP の AX ツリーに「広告」が StaticText で残った）。
      aria-hidden="true"
      className={[fluid ? "jb-paper-fluid" : "", className].filter(Boolean).join(" ")}
      style={{
        position: "relative",
        // fluid のときは .jb-paper-fluid 側で font-size を決める（インラインで上書きしない）
        ...(fluid ? {} : { fontSize: `${10 * scale}px` }),
        fontFamily: FONT_SERIF,
        color: JB.ink,
        background: JB.white,
        border: hair,
        padding: "1.6em 1.8em 1.2em",
        boxSizing: "border-box",
        overflow: "hidden",
        ...style,
      }}
    >
      {animate && <span className="jb-scan" aria-hidden />}

      {showSampleBadge && (
        <span
          style={{
            position: "absolute",
            top: "0.6em",
            left: "0.6em",
            fontFamily: FONT_SANS,
            fontSize: "0.75em",
            letterSpacing: "0.14em",
            color: JB.accent,
            border: `1px solid ${JB.accent}`,
            padding: "0.1em 0.45em",
            lineHeight: 1.6,
            opacity: 0.85,
          }}
        >
          サンプル
        </span>
      )}

      {/* 題字段 */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "1em",
          fontFamily: FONT_SANS,
          fontSize: "0.8em",
          color: JB.muted,
          paddingBottom: "0.6em",
        }}
      >
        <span>{dateText}</span>
        <span
          style={{
            fontFamily: FONT_SERIF,
            fontSize: "2.4em",
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: JB.ink,
            lineHeight: 1,
          }}
        >
          {paperName}
        </span>
        <span>{editionText}</span>
      </div>

      {/* 題字下の二重罫 */}
      <div style={{ borderTop: `3px solid ${JB.ink}` }} />
      <div style={{ borderTop: "1px solid #c9c0ad", marginTop: 2 }} />

      {/* 一面トップ見出し */}
      <div style={{ marginTop: "1.2em" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5em" }}>
          <span
            style={{
              display: "block",
              width: "0.5em",
              height: "2.4em",
              background: JB.accent,
              flex: "none",
              marginTop: "0.25em",
            }}
          />
          <h3
            style={{
              margin: 0,
              fontFamily: FONT_SERIF,
              fontSize: "2em",
              lineHeight: 1.3,
              fontWeight: 700,
              letterSpacing: "0.01em",
            }}
          >
            {headline}
          </h3>
        </div>
        <p
          style={{
            margin: "0.6em 0 0",
            fontFamily: FONT_SANS,
            fontSize: "0.95em",
            lineHeight: 1.7,
            color: JB.muted,
          }}
        >
          {subheadline}
        </p>
      </div>

      {/* 写真＋本文 */}
      <div style={{ display: "flex", gap: "1.2em", marginTop: "1.2em" }}>
        <div style={{ flex: "0 0 58%" }}>
          <div
            style={{
              border: hair,
              background: JB.paperDeep,
              height: "13em",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: "0.8em",
                  letterSpacing: "0.2em",
                  color: JB.muted,
                }}
              >
                写真
              </span>
            )}
          </div>
          <div
            style={{
              fontFamily: FONT_SANS,
              fontSize: "0.75em",
              color: JB.muted,
              marginTop: "0.4em",
              lineHeight: 1.6,
            }}
          >
            紙面レイアウトを保ったまま電子版へ。面移動と記事単位の切り出しができる。
          </div>
        </div>

        <div style={{ flex: 1, borderLeft: hair, paddingLeft: "1.2em" }}>
          <TextLines lines={9} />
          <div style={{ height: "0.8em" }} />
          <TextLines lines={7} width="82%" />
        </div>
      </div>

      {/* 段組み（3段） */}
      <div
        style={{
          display: "flex",
          gap: "1.2em",
          marginTop: "1.2em",
          paddingTop: "1em",
          borderTop: hair,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              paddingLeft: i === 0 ? 0 : "1.2em",
              borderLeft: i === 0 ? "none" : hair,
            }}
          >
            <TextLines lines={i === 2 ? 6 : 8} />
          </div>
        ))}
      </div>

      {/* 広告枠 */}
      <div
        style={{
          marginTop: "1.2em",
          borderTop: hair,
          borderBottom: hair,
          height: "3.2em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT_SANS,
          fontSize: "0.75em",
          letterSpacing: "0.4em",
          color: "#b9b0a0",
        }}
      >
        広告
      </div>
    </div>
  );

  // 絵そのものは aria-hidden なので、名前は外側の箱に持たせる。
  const figure = (
    <div role="img" aria-label={paperLabel}>
      {sheet}
    </div>
  );

  // fluid のときは、幅の基準になる箱で包む（cqw はこの箱の幅を参照する）。
  return fluid ? <div className="jb-paper-box">{figure}</div> : figure;
}
