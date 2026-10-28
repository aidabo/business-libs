"use client";

import { useRef } from "react";
import { FONT_SANS, FONT_SERIF, JB } from "../core";
import FontScaleToggle from "../shared/FontScaleToggle";
import { IMPRINT, navFor, navIdsFor } from "./content";
import { usePaperSettings } from "../shared/PaperSettingsContext";
import usePaperDate, { usePaperEdition } from "../shared/usePaperDate";
import useStickyNav from "./useStickyNav";

// 題字帯（spec §4 の①）。紙面の顔なので、題字・紙面日付・版号を 1 段目に置く。
// 画面幅が狭いときは面ナビを横スクロールの帯にし、文字サイズ切替を帯の右端に出す
// （横に送らないと押せない場所には置かない）。
//
// 紙名・日付・版号は edition.ts からのみ読む。ここに書き写さない。
//
// `listen` は読み上げの帯が出る日だけ true。読み上げの無い日に「読み上げ」の
// 項目を出すと、押しても何も無い場所へ送ることになる。`broadcast` も同じ規則
// （バーチャル放送の帯が出る日だけ true）。
//
// `base` は一覧面（/home/news/broadcast）から使う。ナビの項目を紙面の
// アンカーへ送るための前置きで、付いている間は現在地の印を付けない
// （この面にはその見出しが無く、activeId は空のまま）。`skipHref` は
// 「本文へ」の飛び先。
export default function Masthead({
  listen = false,
  broadcast = false,
  base = "",
  skipHref = "#front",
  demoNote = IMPRINT.demoNote,
  paperName: paperNameProp = "",
  paperNameEn: paperNameEnProp = "",
  showNav = true,
}: {
  listen?: boolean;
  broadcast?: boolean;
  /** ナビの飛び先の前置き（例: `/home/news`）。空なら同じ面の中のアンカーへ飛ぶ。 */
  base?: string;
  /** 「本文へ」の飛び先。一覧面では本文の帯を指す。 */
  skipHref?: string;
  /** 題字の下の断り（架空・デモ）。空なら出さない。 */
  demoNote?: string;
  /** 面ナビを出すか。 */
  showNav?: boolean;
  /** 紙名（空ならホストの設定 NEWS_PAPER_NAME）。 */
  paperName?: string;
  paperNameEn?: string;
}) {
  const headerRef = useRef<HTMLElement | null>(null);
  const activeId = useStickyNav(headerRef, navIdsFor(listen, broadcast));
  const date = usePaperDate();
  const edition = usePaperEdition();
  const settings = usePaperSettings();
  const paperName = paperNameProp.trim() || settings.paperName;
  const paperNameEn = paperNameEnProp.trim() || settings.paperNameEn;
  const nav = navFor(listen, broadcast);

  const current = (href: string) =>
    base === "" && activeId === href.replace(/^#/, "") ? ("location" as const) : undefined;

  return (
    <header ref={headerRef} className="jb-news-head">
      <a className="jb-skip" href={skipHref}>
        本文へ
      </a>
      <div className="jb-wrap">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            paddingTop: 10,
            fontFamily: FONT_SANS,
            fontSize: 12,
            color: JB.muted,
          }}
        >
          <span>
            {date ?? " "}
            <span className="jb-wide-only">　{edition ?? ""}</span>
          </span>
          <span className="jb-wide-only">購読者向け</span>
        </div>

        <div
          style={{
            borderTop: `1px solid ${JB.line}`,
            borderBottom: `3px double ${JB.ink}`,
            padding: "10px 0",
            marginTop: 6,
          }}
        >
          {/*
            題字は「日本語が主・英語を上に」（ユーザー指示 2026-09-27）。英字は字間を
            開けて小さく置く。紙名そのものは日本語側なので、読み上げには渡さない
            （aria-hidden。読み上げは h1 の「火星タイムズ ニュース」で足りる）。
          */}
          <p
            aria-hidden="true"
            style={{
              margin: "0 0 4px",
              textAlign: "center",
              fontFamily: FONT_SANS,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.34em",
              textTransform: "uppercase",
              color: JB.muted,
              lineHeight: 1,
            }}
          >
            {paperNameEn}
          </p>
          <h1
            style={{
              margin: 0,
              textAlign: "center",
              fontFamily: FONT_SERIF,
              fontSize: "clamp(26px, 4vw, 40px)",
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: JB.ink,
              lineHeight: 1.1,
            }}
          >
            {paperName}
          </h1>
        </div>

        {/*
          デモの断り（ユーザー指示: Virtual ニュース・デモのためと分かるように）。
          題字のすぐ下に置くのは、スクロールせずに見える最初の位置だから。記事も紙面も
          社名も架空なので、実在の出来事・人物の報道と読まれないように先に言う。
          朱の囲みは紙面の囲み記事と同じ扱い。朱は暗い地に 6.25:1 で小さくても読める。
        */}
        {demoNote ? (
        <p
          role="note"
          className="jb-demo-note"
          style={{
            margin: "10px 0 0",
            border: `1px solid ${JB.accent}`,
            padding: "6px 10px",
            fontFamily: FONT_SANS,
            fontSize: 12,
            lineHeight: 1.7,
            letterSpacing: "0.02em",
            color: JB.accent,
          }}
        >
          {demoNote}
        </p>
        ) : null}
      </div>

      {showNav ? (
      <>
      {/* 面ナビ（広い画面）。2026-10-07 のユーザー指示（第2弾）で、タブ全体を
          少し大きい字（13→14.5px）・墨色に揃えた（放送だけを朱で出す第1弾の形は
          やめた）。色は PaperStyles の .jb-nav-a が持つ — ここにインラインで
          書くと、現在地・ホバーの朱が勝てない。 */}
      <nav className="jb-wrap jb-nav" aria-label="面" style={{ paddingBottom: 8 }}>
        {nav.map((item) => (
          <a
            key={item.href}
            href={`${base}${item.href}`}
            className="jb-nav-a"
            aria-current={current(item.href)}
            style={{
              fontFamily: FONT_SANS,
              fontSize: 14.5,
              textDecoration: "none",
              letterSpacing: "0.04em",
            }}
          >
            {item.label}
          </a>
        ))}
        <FontScaleToggle className="jb-fs-wide" />
      </nav>

      {/* 面ナビ（狭い画面）: 横スクロールの帯 + 文字サイズ切替。大きさは広い画面に
          合わせる（12.5→14px。ユーザー指示 2026-10-07 第2弾）。 */}
      <div className="jb-wrap jb-navband">
        <nav className="jb-navscroll" aria-label="面">
          {nav.map((item) => (
            <a
              key={item.href}
              href={`${base}${item.href}`}
              className="jb-nav-a"
              aria-current={current(item.href)}
              style={{
                fontFamily: FONT_SANS,
                fontSize: 14,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <FontScaleToggle className="jb-fs-narrow" />
      </div>
      </>
      ) : null}
    </header>
  );
}
