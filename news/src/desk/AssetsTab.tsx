"use client";

import { useMemo, useState, type SyntheticEvent } from "react";
import { FONT_SANS, FONT_SERIF, JB } from "../core";
import { useT } from "../adapter/NewsContext";
import { NewsIcon } from "../shared/icons";
import DeskAudio from "./DeskAudio";
import Panel from "./Panel";
import { ABOVE_CARD_LINK, articleHrefOf } from "./ArticlesTab";
import { ColumnSelect, gridColumnsOf, useColumnChoice } from "./columns";
import DayPicker from "./DayPicker";
import BigPlayVideo from "../shared/BigPlayVideo";
import { AuthorNames, DeskEmpty, DeskError, EditLink, StateChip } from "./parts";
import { canEditArticle, loadView, stateOf, type DeskArticle, type DeskViewer } from "./model";
import {
  EMPTY_MEDIA_FILTER,
  filterPostMedia,
  isMediaFilterActive,
  newsMediaRows,
  type MediaFilter,
  type PostMediaRow,
} from "./postMedia";
import type { Desk } from "./useDesk";
import usePostMedia, { type PostMediaState } from "./usePostMedia";

/** 1 行の枚数の好み（端末に残す。電子紙面・記事とは別の鍵）。 */
const COLUMNS_KEY = "jb-console-assets-columns";
/** 升目の間隔。列数の式と**同じ値**を使う — 片方だけ直すと最終行がずれる。 */
const GRID_GAP = 12;

const TYPE_LABEL: Record<PostMediaRow["type"], string> = { image: "画像", video: "動画", audio: "音声" };

/**
 * 素材タブ（ユーザー指示 2026-10-13 で作り直し）。
 *
 * - 元は Ghost の **post_media**（記事に付いた素材 = feature_image と本文の素材すべて。
 *   `lib/mediaUtils.ts` の `getAllMediaInfo` と同じ範囲）。gallery 全体ではない。
 * - 絞り込みはタブ内に持つ（記事タブと同じ形。グローバルフィルタバーは出さない）。
 *   日付は初期「すべて」— 開いた時点で全素材が出る。
 * - 全件は Console が 1 回読んだもの（`allMedia`）を使う。記事を選ぶと、Ghost に `post_id` で
 *   問い合わせ、その記事の素材だけを出す。
 * - 「編集」は素材の付いた記事の `/editor`。記事の絵は選ばない — カードの絵は規則
 *   （feature_image、無ければ本文の最初の素材）で決まる（ユーザー指示 2026-10-14）。
 */
export default function AssetsTab({
  desk,
  now,
  viewer,
  allMedia,
}: {
  desk: Desk;
  now: Date;
  /** 見ている人。「編集」は記事ごとに `canEditArticle` で絞る。 */
  viewer: DeskViewer | null;
  /** 全記事の素材（Console が 1 回読む）。 */
  allMedia: PostMediaState;
}) {
  const [filter, setFilter] = useState<MediaFilter>(EMPTY_MEDIA_FILTER);
  const [shownCount, setShownCount] = useState(60);
  // 1 行の枚数。**絞りではない**ので MediaFilter に入れない（「解除」で見え方まで跳ばない）。
  const [cols, setCols] = useColumnChoice(COLUMNS_KEY, "auto");

  // 記事を選んだら Ghost 側で絞る（全件を読んでから手元で絞らない）。
  const postScope = filter.postId || null;
  const scoped = usePostMedia(postScope !== null, postScope);
  const source = postScope === null ? allMedia : scoped;
  const { error, truncated } = source;

  const articlesById = useMemo(() => new Map(desk.articles.map((a) => [a.id, a])), [desk.articles]);
  // ニュースの記事（机に載っている記事）の素材だけ。数・空の判定もこれで数える。
  const rows = useMemo(
    () => (source.rows === null ? null : newsMediaRows(source.rows, articlesById)),
    [source.rows, articlesById]
  );
  const shown = useMemo(
    () => (rows === null ? [] : filterPostMedia(rows, filter, articlesById, now)),
    [rows, filter, articlesById, now]
  );
  // 記事の選択肢 — 素材の付いた記事だけ（選んでも 0 件になる記事を並べない）。全件から作る。
  const mediaPostIds = useMemo(() => new Set((allMedia.rows ?? []).map((r) => r.postId)), [allMedia.rows]);
  const articleChoices = useMemo(
    () =>
      desk.articles
        .filter((a) => mediaPostIds.has(a.id))
        .sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || "")),
    [desk.articles, mediaPostIds]
  );
  const selectedArticle = filter.postId ? articlesById.get(filter.postId) ?? null : null;

  const view = loadView(rows === null ? null : rows.length, error);

  const fieldStyle: React.CSSProperties = {
    padding: "4px 7px",
    border: `1px solid ${JB.line}`,
    background: "#fff",
    fontFamily: FONT_SANS,
    fontSize: 12,
  };
  const set = (patch: Partial<MediaFilter>) => {
    setFilter({ ...filter, ...patch });
    setShownCount(60);
  };

  return (
    <Panel
      title="素材"
      eyebrowText="ASSETS"
      right={
        rows !== null && error === null ? (
          <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: JB.muted }}>
            {shown.length}／{rows.length} 点
          </span>
        ) : undefined
      }
    >
      {/* タブ内フィルターバー（記事タブと同じ並び: 絞り → 解除 → 右端に検索） */}
      <div style={{
        borderBottom: `1px solid ${JB.line}`,
        paddingBottom: 10,
        marginBottom: 14,
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
        alignItems: "center",
      }}>
        <DayPicker pickedDay={filter.day} onPickDay={(day) => set({ day })} articles={desk.articles} now={now} />

        <select value={filter.state} onChange={(e) => set({ state: e.target.value as MediaFilter["state"] })} aria-label="記事の状態" style={fieldStyle}>
          <option value="all">状態：すべて</option>
          <option value="published">公開</option>
          <option value="scheduled">予約</option>
          <option value="overdue">予約（時刻を過ぎ）</option>
          <option value="draft">下書き</option>
        </select>

        {desk.faces.length > 0 && (
          <select value={filter.face} onChange={(e) => set({ face: e.target.value })} aria-label="面" style={fieldStyle}>
            <option value="">面：すべて</option>
            {desk.faces.map((f) => (
              <option key={f.slug} value={f.label}>{f.label}</option>
            ))}
          </select>
        )}

        {desk.mediums.length > 0 && (
          <select value={filter.medium} onChange={(e) => set({ medium: e.target.value })} aria-label="媒体" style={fieldStyle}>
            <option value="">媒体：すべて</option>
            {desk.mediums.map((m) => (
              <option key={m.slug} value={m.slug}>{m.name}</option>
            ))}
          </select>
        )}

        <select value={filter.type} onChange={(e) => set({ type: e.target.value as MediaFilter["type"] })} aria-label="素材の種類" style={fieldStyle}>
          <option value="all">種類：すべて</option>
          <option value="image">画像</option>
          <option value="video">動画</option>
          <option value="audio">音声</option>
        </select>

        <select
          value={filter.postId}
          onChange={(e) => set({ postId: e.target.value })}
          aria-label="記事で絞る"
          style={{ ...fieldStyle, maxWidth: 260 }}
        >
          <option value="">記事：すべて</option>
          {/* 選んだ記事が選択肢から外れても（再読込の間など）、選択は見えたままにする */}
          {selectedArticle && !articleChoices.some((a) => a.id === selectedArticle.id) && (
            <option value={selectedArticle.id}>{selectedArticle.title}</option>
          )}
          {articleChoices.map((a) => (
            <option key={a.id} value={a.id}>{a.title}</option>
          ))}
        </select>

        {/* 1 行の枚数（電子紙面と同じ口・ユーザー指示 2026-10-14）。「自動」は従来の詰め方。 */}
        <ColumnSelect value={cols} onChange={setCols} style={fieldStyle} />

        {isMediaFilterActive(filter) && (
          <button
            type="button"
            onClick={() => set(EMPTY_MEDIA_FILTER)}
            style={{ fontFamily: FONT_SANS, fontSize: 11.5, border: `1px solid ${JB.line}`, background: "transparent", padding: "4px 10px", cursor: "pointer", color: JB.muted }}
          >
            解除
          </button>
        )}

        <input
          type="search"
          value={filter.word}
          onChange={(e) => set({ word: e.target.value })}
          placeholder="記事名・キャプションで検索"
          aria-label="素材を検索"
          style={{ ...fieldStyle, width: 200, marginLeft: "auto" }}
        />
      </div>

      {/* 記事を 1 本選んでいるときだけ、その記事の「編集」を出す */}
      {selectedArticle && (
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", fontFamily: FONT_SANS, fontSize: 12.5, color: JB.muted, margin: "0 0 12px" }}>
          <span>{selectedArticle.title}</span>
          <EditLink postId={selectedArticle.id} canEdit={canEditArticle(viewer, selectedArticle)} />
        </div>
      )}

      {view === "error" ? (
        <DeskError message={error ?? "素材を取得できませんでした"} />
      ) : view === "loading" ? (
        <DeskEmpty>素材を読んでいます…</DeskEmpty>
      ) : view === "empty" ? (
        <DeskEmpty>{filter.postId ? "この記事に付いた素材はありません。" : "記事に付いた素材はまだありません。"}</DeskEmpty>
      ) : shown.length === 0 ? (
        <DeskEmpty>この絞り込みに合う素材はありません。</DeskEmpty>
      ) : (
        <>
          {truncated && (
            <p style={{ fontFamily: FONT_SANS, fontSize: 11.5, color: JB.accent, margin: "0 0 10px" }}>
              素材が多いため、新しい順に {rows?.length ?? 0} 点までを読みました。記事を選ぶと、その記事の素材はすべて出ます。
            </p>
          )}
          <div className="jb-card-grid-media" style={{ display: "grid", gridTemplateColumns: gridColumnsOf(cols, { autoMin: "min(200px, 100%)", floor: 140, gap: GRID_GAP }), gap: GRID_GAP }}>
            {shown.slice(0, shownCount).map((row) => {
              const article = articlesById.get(row.postId) ?? null;
              return (
                <MediaCard
                  key={row.id}
                  row={row}
                  article={article}
                  now={now}
                  // 机の一覧に無い記事は判定できない — 「できる」と言わない
                  canEdit={article !== null && canEditArticle(viewer, article)}
                />
              );
            })}
          </div>
          {shown.length > shownCount && (
            <button
              type="button"
              onClick={() => setShownCount((n) => n + 60)}
              style={{ fontFamily: FONT_SANS, fontSize: 12.5, marginTop: 12, border: `1px solid ${JB.line}`, background: "transparent", padding: "7px 14px", cursor: "pointer" }}
            >
              残り {shown.length - shownCount} 点を出す
            </button>
          )}
        </>
      )}

    </Panel>
  );
}

/** カードの上の操作は押してもカードのリンクへ伝えない（GalleryAssetCard の操作と同じ扱い）。 */
const stop = (e: SyntheticEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

/** 隅・中央の操作の地（GalleryAssetCard の IconButton と同じ色）。 */
const ACTION_STYLE = {
  width: 32,
  height: 32,
  border: 0,
  borderRadius: 999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(15,23,42,0.72)",
  color: "#fff",
  cursor: "pointer",
} as const;

/**
 * 素材 1 点。**見た目は StackPage の `GalleryAssetGrid` と同じ部品**（画像は `GalleryAssetView`、
 * 音声は `AudioCard`、動画は同じ枠に記事タブと共用の `BigPlayVideo`）。操作は旧素材タブの
 * `components/gallery/GalleryAssetCard` に揃える: 右上の「Open media」で素材を新しいタブに
 * 原寸で開き、動画は中央の ▶ でその場で再生・停止する（ユーザー指示 2026-10-14）。
 * カードの残りを押すと記事ページへ。URL は `toPostMediaRow` が `safeMediaUrl` で通した物だけ
 * （`src` / 開く先に `javascript:` などは載らない）。
 */
function MediaCard({
  row,
  article,
  now,
  canEdit,
}: {
  row: PostMediaRow;
  article: DeskArticle | null;
  now: Date;
  /** この記事を編集できるか（`canEditArticle`）。できなければ「編集」を押せない。 */
  canEdit: boolean;
}) {
  const t = useT();
  const title = article?.title || row.postTitle || "（題なし）";
  // 再生できる物（動画・音声）はプレーヤーの操作をカードのリンクより上に出す。画像は下に置き、
  // 押すと記事へ行く（素材そのものは隅の「Open media」で開く）。
  const playable = row.type !== "image";
  // 素材そのものを新しいタブで原寸で開く（GalleryAssetCard の handleOpen と同じ）。
  // URL は toPostMediaRow が safeMediaUrl で通した物だけ。
  const handleOpen = (e: SyntheticEvent) => {
    stop(e);
    window.open(row.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-w-0 overflow-hidden rounded-lg" style={{ position: "relative", background: JB.white, display: "flex", flexDirection: "column" }}>
      {/* カード全体を押すと記事ページへ（記事タブと同じ行き先・同じ形: カードを覆う 1 本のリンク、
          押せる物だけ ABOVE_CARD_LINK で上に出す — リンクの中にボタンを入れない）。 */}
      {row.postId && (
        <a
          href={articleHrefOf({ id: row.postId })}
          aria-label={`${title}を開く`}
          style={{ position: "absolute", inset: 0, zIndex: 1 }}
        />
      )}
      <div style={playable ? ABOVE_CARD_LINK : { position: "relative" }}>
        {row.type === "audio" ? (
          <DeskAudio src={row.url} title={row.caption || title} playOnHeaderClick />
        ) : row.type === "video" ? (
          // GalleryAssetView と同じ枠に、記事タブと共用の BigPlayVideo（大きな ▶ でその場で再生）
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <BigPlayVideo src={row.url} poster={row.thumbnailUrl} height={180} />
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm" style={{ height: 180 }}>
            <img src={row.url} alt={row.caption || title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
          </div>
        )}
        {/* 素材を開く（GalleryAssetCard と同じ右上の OpenInNew）。画像の段はリンクの下なので、
            ここだけ zIndex でリンクより上に出す。 */}
        <div style={{ position: "absolute", top: 6, right: 6, zIndex: 3 }}>
          <button
            type="button"
            title={t("Open media")}
            aria-label={t("Open media")}
            onClick={handleOpen}
            onMouseDown={(e) => e.stopPropagation()}
            style={ACTION_STYLE}
          >
            <NewsIcon name="open" size={18} />
          </button>
        </div>
      </div>
      <div style={{ padding: "8px 4px 4px", display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
          {article && <StateChip state={stateOf(article, now)} at={article.published_at} solid />}
          <span style={{ fontFamily: FONT_SANS, fontSize: 10, background: "rgba(0,0,0,0.72)", color: "#fff", padding: "2px 6px" }}>
            {TYPE_LABEL[row.type]}{row.role === "feature" ? "・記事の絵" : ""}
          </span>
        </div>
        <div style={{ fontFamily: FONT_SERIF, fontSize: 13.5, lineHeight: 1.5, color: JB.ink, flex: 1 }}>
          {title}
        </div>
        {article && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            <AuthorNames article={article} />
          </div>
        )}
        {row.caption && (
          <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: JB.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {row.caption}
          </div>
        )}
        <div style={{ ...ABOVE_CARD_LINK, display: "flex", gap: 6, justifyContent: "flex-end", paddingTop: 4, borderTop: `1px solid ${JB.line}` }}>
          {row.postId && <EditLink postId={row.postId} canEdit={canEdit} />}
        </div>
      </div>
    </div>
  );
}
