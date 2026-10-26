"use client";

import type { NewsPost as Post } from "../core";
import { FONT_SANS, FONT_SERIF, JB } from "../core";
import PaperMock from "../shared/PaperMock";
import type { PaperEdition } from "../core";
import { usePaperSettings } from "../shared/PaperSettingsContext";
import usePaperDate, { usePaperEdition } from "../shared/usePaperDate";
import { selectFrontPage } from "../core";

// 今日の紙面（spec §4 の⑤）。
//
// 2 つに分けて書く。上は「今日の紙面」＝これから出る 1 面の姿で、見出しは
// 第一面の主役と同じものを出す（同じ記事を指していることを見せる）。題字・日付・
// 版号は edition.ts から読み、題字帯（①）と必ず一致させる。
//
// 下は「配信中の紙面」＝高精細ビューアに上がっている版の一覧。ここを「今日の紙面」
// の見出しで一続きに書くと、昨日の版が並んでいても今日の紙面だと言っていることに
// なる。別の見出しにして、何の一覧なのかを名前で言う。
//
// 導線は紙面が 1 件以上あるときだけ出す。無いのに「配信中」と書かない（§4 の⑤・§10-8）。

/** 紙面 1 枚。絵が無ければ枠だけ出す（偽の絵を置かない）。 */
function PaperTile({ edition }: { edition: PaperEdition }) {
  return (
    <a href={edition.viewerUrl} className="jb-card jb-paper-tile">
      <span className="jb-paper-frame">
        {edition.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={edition.previewUrl} alt="" className="jb-paper-img" />
        ) : null}
      </span>
      <span className="jb-paper-name jb-clamp-2">{edition.title || "紙面"}</span>
      {edition.pageCount > 0 ? (
        <span className="jb-paper-pages">{edition.pageCount} ページ</span>
      ) : null}
    </a>
  );
}

export default function PaperPreview({
  posts,
  editions = [],
  viewerHref = "/deepzoom/",
}: {
  posts: Post[];
  /** 配信中の紙面（`host-news-editions-public`）。空なら棚を出さない。 */
  editions?: PaperEdition[];
  /** 「高精細ビューア」の行き先。 */
  viewerHref?: string;
}) {
  const front = selectFrontPage(posts);
  const date = usePaperDate();
  const edition = usePaperEdition();
  const { paperName } = usePaperSettings();
  const available = editions.length > 0;

  if (!front.lead) return null;

  return (
    <section id="paper" className="jb-news-section">
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
          今日の電子紙面
        </h2>
        <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: JB.muted }}>
          {date ?? " "}　{edition ?? ""}
        </span>
      </div>

      <div className="jb-two">
        <div style={{ minWidth: 0 }}>
          <PaperMock fluid headline={front.lead.title} subheadline="" />
        </div>

        <div style={{ minWidth: 0, fontFamily: FONT_SANS, fontSize: 15, lineHeight: 2, color: JB.muted }}>
          <p style={{ margin: 0 }}>
            紙面は {paperName} のレイアウトを保ったまま電子版として配信しています。面の移動と、記事単位の切り出しができます。
          </p>
          <p style={{ margin: "14px 0 0", fontSize: 15 }}>
            見出しは第一面の主役と同じものが入ります。
          </p>
        </div>
      </div>

      {/* 読み込み中に「ありません」と書かない。有無が決まってから出す。 */}
      {available && (
        <div style={{ marginTop: "clamp(20px, 2.6vw, 30px)" }}>
          <h3
            style={{
              fontFamily: FONT_SANS,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.06em",
              color: JB.ink,
              margin: "0 0 12px",
              paddingBottom: 6,
              borderBottom: `1px solid ${JB.line}`,
            }}
          >
            配信中の紙面
          </h3>

          <div className="jb-paper-grid">
            {editions.map((edition) => (
              <PaperTile key={edition.id} edition={edition} />
            ))}
          </div>

          <p style={{ margin: "12px 0 0", fontFamily: FONT_SANS, fontSize: 12, color: JB.muted }}>
            新しい順に {editions.length} 件。一覧は{" "}
            <a href={viewerHref} style={{ color: JB.ink, textDecoration: "underline" }}>
              高精細ビューア
            </a>
            で開けます。
          </p>
        </div>
      )}
    </section>
  );
}
