"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { faceTagOptions, mediumTagOptions } from "../core";
import { FONT_SANS, JB } from "../core";
import { ColumnSelect, gridColumnsOf, useColumnChoice, type ColumnChoice } from "./columns";
import type { PaperEdition } from "../core";
import { dayLabel, stampLabel, type DeskTag } from "./model";
import { DeskEmpty } from "./parts";
import {
  EMPTY_EDITION_FILTER,
  dayOfEdition,
  editionDaysOf,
  editionFaceLabel,
  editionFilterActive,
  editionMediumName,
  filterEditions,
  type EditionFilter,
  type EditionOrder,
  type EditionStatusFilter,
} from "./paperEditions";

/** 1 行の枚数（列数）の好み。端末ごとに残す（見え方の話で、データではない）。 */
const COLUMNS_KEY = "jb-console-paper-columns";
/** 既定は 6 列（ユーザー指示 2026-10-11: 従来の自動詰めは PC で小さすぎた）。
    `.jb-wrap` の広い画面で 1 枚 ~248px — 見出しが読める大きさ。 */
const DEFAULT_COLUMNS: ColumnChoice = "6";
/** 升目の間隔。列数の式と**同じ値**を使う — 片方だけ直すと最終行がずれる。 */
const GRID_GAP = 8;

/**
 * 電子紙面の棚（EDITIONS）。**机で紙面を探す口はここが初めての場所**。
 *
 * 一覧は親（PaperTab）が route から 1 回読んで渡す（窓）。ここは窓の中を手元で
 * 絞るだけ — 打鍵ごとに往復しない。判定は paperEditions.ts の純関数 1 か所。
 *
 * **既定は窓のすべて**（ユーザー指示 2026-10-10）。最初から日で隠すと、窓が大きい
 * ほど「紙面が無い」と読める。日 select は絞るための口として残す。並び順
 * （新しい順 / 古い順）もここで選ぶ。
 *
 * 媒体・面の口は agent フォームと同じ deskLinks の 2 本で作る（同じ規則で選択肢を
 * 組み立てる — 片方だけ直すと机と agent で選択肢が食い違う）。
 *
 * 1 行の枚数（列）もここで選ぶ（ユーザー指示 2026-10-11: 従来の自動詰めは PC で
 * 小さすぎた）。**絞りではない**ので `EditionFilter` には入れない — 「解除」で
 * 見え方まで跳ばない。選んだ数は端末に残す。
 */
export default function PaperEditions({
  editions,
  mediums,
  tags,
}: {
  editions: PaperEdition[];
  mediums: DeskTag[];
  tags: DeskTag[];
}) {
  const [filter, setFilter] = useState<EditionFilter>(EMPTY_EDITION_FILTER);
  // 列は**絞りではない** — `EditionFilter` に入れない（「解除」で見え方まで戻ると、
  // 絞りを消したつもりで列まで既定に跳ぶ）。端末に残す。
  const [cols, setCols] = useColumnChoice(COLUMNS_KEY, DEFAULT_COLUMNS);

  const shown = useMemo(
    () => filterEditions(editions, filter, mediums, tags),
    [editions, filter, mediums, tags],
  );
  const days = useMemo(() => editionDaysOf(editions), [editions]);
  const mediumOptions = useMemo(() => mediumTagOptions(mediums), [mediums]);
  const faceOptions = useMemo(() => faceTagOptions(tags), [tags]);
  const active = editionFilterActive(filter);

  // 列数を絞るときの升の下端。**広い画面ではちょうど N 列で止まる** — auto-fill で
  // N+1 列目が入るには隙間 1 本ぶん (8px) 足りないため。狭い画面では床の 120px が
  // 勝って自動で減る（携帯の見え方は従来のまま）。％は親の内容幅で解ける。
  const gridColumns = gridColumnsOf(cols, { autoMin: "120px", floor: 120, gap: GRID_GAP });

  // ConsoleFilterBar（Console.tsx）の口と同じ見た目。あちらは Console 内の私物なので
  // ここにも 1 つ置く（余白の起点だけ違う: あちらは左に 4 足す）。
  const field: CSSProperties = {
    padding: "4px 7px",
    border: `1px solid ${JB.line}`,
    background: "#fff",
    fontFamily: FONT_SANS,
    fontSize: 12,
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <span style={{ fontFamily: FONT_SANS, fontSize: 11, letterSpacing: "0.12em", color: JB.muted }}>EDITIONS</span>
        {/* 出している数／読んだ数。**常に出す** — 絞り込みで何面が隠れているかが、
            ここで見えないと「紙面が無い」と読めてしまう。 */}
        <span
          title={`直近 ${editions.length} 面を読み、うち ${shown.length} 面を出しています`}
          style={{ fontFamily: FONT_SANS, fontSize: 11, color: JB.muted }}
        >
          {shown.length}／{editions.length} 面
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <a href="/jobs/deepzoom/" style={{ fontFamily: FONT_SANS, fontSize: 11.5, color: JB.muted, textDecoration: "underline" }}>
            取り込み一覧 →
          </a>
          <a href="/deepzoom/" style={{ fontFamily: FONT_SANS, fontSize: 11.5, color: JB.muted, textDecoration: "underline" }}>
            高精細ビューア →
          </a>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
        {/* 選択肢が空の口は出さない — 絞る軸が無いのに口だけ出すと、何も起きない操作になる。 */}
        {/* 面 → 媒体の順・aria-label「面」「媒体」・「面：すべて」は机の 5 タブで揃える（2026-10-15）。 */}
        {faceOptions.length > 0 && (
          <select
            aria-label="面"
            value={filter.faceId}
            onChange={(event) => setFilter({ ...filter, faceId: event.target.value })}
            style={field}
          >
            <option value="">面：すべて</option>
            {faceOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        )}
        {mediumOptions.length > 0 && (
          <select
            aria-label="媒体"
            value={filter.mediumId}
            onChange={(event) => setFilter({ ...filter, mediumId: event.target.value })}
            style={field}
          >
            <option value="">媒体：すべて</option>
            {mediumOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
        )}
        {days.length > 0 && (
          <select
            aria-label="紙面日で絞る"
            value={filter.day}
            onChange={(event) => setFilter({ ...filter, day: event.target.value })}
            style={field}
          >
            <option value="">日: すべて</option>
            {days.map((entry) => (
              <option key={entry.day} value={entry.day}>
                紙面 {dayLabel(entry.day)}（{entry.count}）
              </option>
            ))}
          </select>
        )}
        {/* 公開状態の絞り（编集局向け: 下書きも一覧に出るため）。 */}
        <select
          aria-label="公開状態で絞る"
          value={filter.status}
          onChange={(event) => setFilter({ ...filter, status: event.target.value as EditionStatusFilter })}
          style={field}
        >
          <option value="all">状態: すべて</option>
          <option value="published">公開</option>
          <option value="draft">下書き</option>
        </select>
        {/* 並び順も絞りの口の 1 つ（ユーザー指示 2026-10-10）。窓の中の並べ替えだけ —
            読む順（route）には触らない。 */}
        <select
          aria-label="並び順を選ぶ"
          value={filter.order}
          onChange={(event) => setFilter({ ...filter, order: event.target.value as EditionOrder })}
          style={field}
        >
          <option value="newest">並び: 新しい順</option>
          <option value="oldest">並び: 古い順</option>
        </select>
        {/* 1 行の枚数（ユーザー指示 2026-10-11）。「自動」は従来の詰め方（床 120px）。
            既定は 6 列 — 広い画面でも 1 枚が読める大きさになる。数の好みは端末に残る。 */}
        <ColumnSelect value={cols} onChange={setCols} style={field} />
        {active && (
          <button
            type="button"
            onClick={() => setFilter(EMPTY_EDITION_FILTER)}
            style={{ fontFamily: FONT_SANS, fontSize: 11.5, border: `1px solid ${JB.line}`, background: "transparent", padding: "4px 10px", cursor: "pointer", color: JB.muted }}
          >
            解除
          </button>
        )}
        {/* 検索はバーの右端（記事タブと同じ並び — ユーザー指示 2026-10-12）。 */}
        <input
          type="search"
          value={filter.keyword}
          onChange={(event) => setFilter({ ...filter, keyword: event.target.value })}
          placeholder="紙名・版で検索"
          aria-label="紙面を検索"
          style={{ ...field, width: 150, marginLeft: "auto" }}
        />
      </div>

      {shown.length === 0 ? (
        <DeskEmpty>この絞り込みに合う紙面はありません。</DeskEmpty>
      ) : (
        <div className="jb-card-grid-media" style={{ display: "grid", gridTemplateColumns: gridColumns, gap: GRID_GAP }}>
          {shown.map((edition) => (
            <EditionCard key={edition.id} edition={edition} mediums={mediums} tags={tags} />
          ))}
        </div>
      )}
    </div>
  );
}

function EditionCard({ edition, mediums, tags }: { edition: PaperEdition; mediums: DeskTag[]; tags: DeskTag[] }) {
  const medium = editionMediumName(edition, mediums);
  const face = editionFaceLabel(edition, tags);
  const day = dayOfEdition(edition);
  const pageStamp = edition.pageCount > 0 ? `${edition.pageCount}p` : "";

  // publication_name（取り込み時スナップショット）を主題にする。
  const primaryName = edition.publicationName || edition.sourceName || edition.title || "紙面";
  const editionSub = edition.edition && edition.edition !== primaryName ? edition.edition : "";

  // 媒体・面タグはスナップショットと異なる場合だけチップで出す（重複を避ける）。
  const showMediumChip = medium && medium !== primaryName;
  const showFaceChip = face && face !== edition.edition;

  // 状態: is_public=true → published、false → draft。
  // undefined（古い応答・フィールド未対応）は公開扱い（public endpoint は公開済みしか返さない）。
  const chipState: "published" | "draft" = edition.isPublic !== false ? "published" : "draft";

  // 作成日は公開日と別日のときだけ出す。
  const createdDate = edition.createdAt
    ? new Date(edition.createdAt).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })
    : (edition.datedAt && !edition.publishedAt
        ? new Date(edition.datedAt).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })
        : "");
  const publishedDate = edition.publishedAt
    ? new Date(edition.publishedAt).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })
    : "";
  const showCreatedDate = createdDate && createdDate !== publishedDate;

  return (
    // カード全体クリックでビューアへ遷移。div + onClick で別タブを開く。
    // ビューアへの明示リンクはカード下部に別途置く（ネストした <a> は無効 HTML のため）。
    <div
      role="button"
      tabIndex={0}
      onClick={() => window.open(edition.viewerUrl, "_blank", "noreferrer")}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") window.open(edition.viewerUrl, "_blank", "noreferrer"); }}
      style={{ display: "flex", flexDirection: "column", gap: 0, border: `1px solid ${JB.line}`, background: JB.white, overflow: "hidden", cursor: "pointer" }}
    >
      {edition.previewUrl ? (
        <img src={edition.previewUrl} alt="" loading="lazy" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }} onError={(event) => { event.currentTarget.style.display = "none"; }} />
      ) : (
        <div style={{ width: "100%", aspectRatio: "3/4", background: "#e8e4da", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: FONT_SANS, fontSize: 10, color: JB.muted }}>紙面</span>
        </div>
      )}
      <div style={{ padding: "5px 6px", display: "flex", flexDirection: "column", gap: 3 }}>
        {/* 紙名（主題）*/}
        <div title={primaryName} style={{ fontFamily: FONT_SANS, fontSize: 10.5, fontWeight: 600, color: JB.ink, lineHeight: 1.4, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
          {primaryName}
        </div>
        {/* 版・面名（スナップショット）— 紙名と異なるときだけ */}
        {editionSub && (
          <div title={editionSub} style={{ fontFamily: FONT_SANS, fontSize: 10, color: JB.muted, lineHeight: 1.3, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
            {editionSub}
          </div>
        )}
        {/* 状態バッジ: inline chip — border なしで button に見えない */}
        <div>
          <span style={{
            display: "inline",
            fontFamily: FONT_SANS,
            fontSize: 10,
            padding: "1px 5px",
            borderRadius: 2,
            background: chipState === "published" ? "#e8f4ee" : "#f0f0f0",
            color: chipState === "published" ? "#2d7a4f" : JB.muted,
            whiteSpace: "nowrap",
          }}>
            {chipState === "published"
              ? (edition.publishedAt ? `公開 ${stampLabel(edition.publishedAt)}` : "公開")
              : "下書き"}
          </span>
        </div>
        {/* 媒体・面タグ — スナップショットと異なるときだけ */}
        {(showMediumChip || showFaceChip) && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {showMediumChip && <span style={cardChip}>{medium}</span>}
            {showFaceChip && <span style={cardChip}>{face}</span>}
          </div>
        )}
        {/* 紙面日 / ページ数 / 作成日 */}
        <div style={{ fontFamily: FONT_SANS, fontSize: 10, color: JB.muted, display: "flex", gap: 4, flexWrap: "wrap" }}>
          {day && <span>紙面 {dayLabel(day)}</span>}
          {pageStamp && <span>{pageStamp}</span>}
          {showCreatedDate && <span title="取り込み日">作成 {createdDate}</span>}
        </div>
        {/* ビューアへの明示リンク（カードクリックとは独立した口）*/}
        <a
          href={edition.viewerUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{ fontFamily: FONT_SANS, fontSize: 10, color: JB.muted, textDecoration: "underline", marginTop: 2 }}
        >
          ビューアで見る →
        </a>
      </div>
    </div>
  );
}

/** カードの素性チップ。 */
const cardChip: CSSProperties = {
  fontFamily: FONT_SANS,
  fontSize: 10,
  color: JB.muted,
  border: `1px solid ${JB.line}`,
  padding: "0 4px",
  whiteSpace: "nowrap",
};
