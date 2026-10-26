"use client";

import { useMemo, useState } from "react";
import { FONT_SANS, FONT_SERIF, JB } from "../core";
import { articleArtifactsOf, artifactPresenceOf, indexArticleArtifacts } from "../core";
import Panel from "./Panel";
import { ArticleMeta, ArtifactBadge, AuthorNames, ArtifactIcons, DeskEmpty, DeskError, EditLink, StateChip } from "./parts";
import { ColumnSelect, gridColumnsOf, useColumnChoice } from "./columns";
import AudioCard from "./DeskAudio";
import DayPicker from "./DayPicker";
import BigPlayVideo from "../shared/BigPlayVideo";
import NewArticleDialog from "./NewArticleDialog";
import WriteDialog from "./WriteDialog";
import {
  DEFAULT_ARTICLE_SORT,
  EMPTY_FILTER,
  canEditArticle,
  cardOf,
  filterArticles,
  frontPageCandidates,
  replacedOf,
  sortArticles,
  stateOf,
  type ArticleFilter,
  type ArticleSort,
  type DeskArticle,
  type DeskViewer,
  type PresenceFilter,
} from "./model";
import type { Desk } from "./useDesk";
import type { NewsJobRow } from "./useNewsJobs";
import type { NewsBroadcastSelection } from "../core";

/**
 * 記事タブ。**全状態**（公開・予約・下書き）を 1 枚に並べ、既定は更新の新しい順（spec §4.2）。
 *
 * フィルターはタブ内に持つ（日付・状態・面・媒体・音声・放送・並べ替え・キーワード）。グローバル
 * フィルタバーは記事タブでは出さない（Console.tsx の条件 `tab !== "articles"` を参照）。
 *
 * 日付もタブで持つ。**初期は「すべて」**（ユーザー指示 2026-10-12: 記事は日で切らずに
 * 全部を見たい）。他のタブ（Console の pickedDay、初期は当日）とは独立。
 */
export default function ArticlesTab({
  desk,
  canPublish,
  now,
  filter: _filter,
  onFilter: _onFilter,
  artifactJobs,
  artifactSelections,
  artifactNote,
  viewer,
}: {
  desk: Desk;
  canPublish: boolean;
  now: Date;
  filter: ArticleFilter;
  onFilter: (f: ArticleFilter) => void;
  artifactJobs: NewsJobRow[] | null;
  artifactSelections: NewsBroadcastSelection[];
  artifactNote: string | null;
  /** 見ている人。「編集」を押せるかは記事ごとに `canEditArticle` で決める。 */
  viewer: DeskViewer | null;
}) {
  // タブ独自のフィルター状態（グローバルフィルタバーとは独立）。
  const [filter, setFilter] = useState<ArticleFilter>(EMPTY_FILTER);
  const [writing, setWriting] = useState<DeskArticle | null>(null);
  const [busy, setBusy] = useState(false);
  const [shownCount, setShownCount] = useState(50);
  const [sort, setSort] = useState<ArticleSort>(DEFAULT_ARTICLE_SORT);
  const [pickedDay, onPickDay] = useState<string | null>(null);
  // 1 行の枚数。**絞りではない**ので hasFilter に数えない（「解除」で見え方まで跳ばない）。
  const [cols, setCols] = useColumnChoice(COLUMNS_KEY, "auto");

  const hasFilter =
    pickedDay !== null ||
    filter.state !== "all" ||
    filter.face !== "" ||
    filter.medium !== "" ||
    filter.word !== "" ||
    filter.voice !== "all" ||
    filter.avatar !== "all";

  const artifacts = useMemo(() => indexArticleArtifacts(artifactJobs, null, artifactSelections), [artifactJobs, artifactSelections]);
  const { rows, waiting } = useMemo(() => {
    const { rows: matched, waiting: waitingNow } = filterArticles(
      desk.articles,
      filter,
      now,
      pickedDay,
      (article) => (artifactJobs === null ? null : artifactPresenceOf(artifacts, article.slug))
    );
    return {
      rows: sortArticles(matched, sort),
      waiting: waitingNow,
    };
  }, [desk.articles, filter, now, pickedDay, sort, artifactJobs, artifacts]);

  const siblings = useMemo(() => frontPageCandidates(desk.articles), [desk.articles]);

  const fieldStyle: React.CSSProperties = {
    padding: "4px 7px",
    border: `1px solid ${JB.line}`,
    background: "#fff",
    fontFamily: FONT_SANS,
    fontSize: 12,
  };

  if (desk.status === "error") return <Panel title="記事"><DeskError message={desk.error ?? ""} /></Panel>;

  return (
    <Panel
      title="記事"
      eyebrowText="ARTICLES"
      right={
        <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
          {desk.status === "ready" && (
            <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: JB.muted }}>
              {rows.length}／{desk.articles.length} 本
            </span>
          )}
        </div>
      }
    >
      {/* タブ内フィルターバー */}
      {desk.status === "ready" && (
        <div style={{
          borderBottom: `1px solid ${JB.line}`,
          paddingBottom: 10,
          marginBottom: 14,
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          alignItems: "center",
        }}>
          <DayPicker pickedDay={pickedDay} onPickDay={onPickDay} articles={desk.articles} now={now} />

          <select
            value={filter.state}
            onChange={(e) => setFilter({ ...filter, state: e.target.value as ArticleFilter["state"] })}
            style={fieldStyle}
          >
            <option value="all">状態：すべて</option>
            <option value="published">公開</option>
            <option value="scheduled">予約</option>
            <option value="overdue">予約（時刻を過ぎ）</option>
            <option value="draft">下書き</option>
          </select>

          {desk.faces.length > 0 && (
            <select
              value={filter.face}
              onChange={(e) => setFilter({ ...filter, face: e.target.value })}
              aria-label="面"
              style={fieldStyle}
            >
              <option value="">面：すべて</option>
              {desk.faces.map((f) => (
                <option key={f.slug} value={f.label}>{f.label}</option>
              ))}
            </select>
          )}

          {desk.mediums.length > 0 && (
            <select
              value={filter.medium}
              onChange={(e) => setFilter({ ...filter, medium: e.target.value })}
              aria-label="媒体"
              style={fieldStyle}
            >
              <option value="">媒体：すべて</option>
              {desk.mediums.map((m) => (
                <option key={m.slug} value={m.slug}>{m.name}</option>
              ))}
            </select>
          )}

          <select
            value={filter.voice}
            onChange={(e) => setFilter({ ...filter, voice: e.target.value as PresenceFilter })}
            aria-label="音声読み上げの有無"
            style={fieldStyle}
          >
            <option value="all">音声：すべて</option>
            <option value="yes">音声あり</option>
            <option value="no">音声なし</option>
          </select>

          <select
            value={filter.avatar}
            onChange={(e) => setFilter({ ...filter, avatar: e.target.value as PresenceFilter })}
            aria-label="バーチャル放送の有無"
            style={fieldStyle}
          >
            <option value="all">放送：すべて</option>
            <option value="yes">放送あり</option>
            <option value="no">放送なし</option>
          </select>

          <select
            value={`${sort.key}:${sort.dir}`}
            onChange={(e) => {
              const [key, dir] = e.target.value.split(":") as [ArticleSort["key"], ArticleSort["dir"]];
              setSort({ key, dir });
            }}
            aria-label="表示順"
            style={fieldStyle}
          >
            <option value="updated:desc">更新：新しい順</option>
            <option value="updated:asc">更新：古い順</option>
            <option value="published:desc">公開：新しい順</option>
            <option value="published:asc">公開：古い順</option>
            <option value="created:desc">作成：新しい順</option>
            <option value="created:asc">作成：古い順</option>
          </select>

          {/* 1 行の枚数（電子紙面と同じ口・ユーザー指示 2026-10-14）。「自動」は従来の詰め方。 */}
          <ColumnSelect value={cols} onChange={setCols} style={fieldStyle} />

          {hasFilter && (
            <button
              type="button"
              onClick={() => { setFilter(EMPTY_FILTER); onPickDay(null); }}
              style={{
                fontFamily: FONT_SANS,
                fontSize: 11.5,
                border: `1px solid ${JB.line}`,
                background: "transparent",
                padding: "4px 10px",
                cursor: "pointer",
                color: JB.muted,
              }}
            >
              解除
            </button>
          )}

          {/* 検索はバーの右端（ユーザー指示 2026-10-12）。折り返した行でも右に寄る。 */}
          <input
            type="search"
            value={filter.word}
            onChange={(e) => setFilter({ ...filter, word: e.target.value })}
            placeholder="記事を検索"
            aria-label="記事を検索"
            style={{ ...fieldStyle, width: 180, marginLeft: "auto" }}
          />
        </div>
      )}

      {rows.length > 0 && (
        <p style={{ fontFamily: FONT_SANS, fontSize: 11.5, color: JB.muted, margin: "0 0 10px", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          {artifactJobs === null
            ? "読み上げの印を読み込んでいます…"
            : artifactNote ?? (
              <>
                <ArtifactBadge kind="voice" /> 音声読み上げ
                <ArtifactBadge kind="avatar" /> アバター放送 — 印のある記事は押すと開きます。
              </>
            )}
        </p>
      )}

      {desk.status !== "ready" ? (
        <DeskEmpty>読み込んでいます…</DeskEmpty>
      ) : rows.length === 0 ? (
        <DeskEmpty>
          {desk.articles.length === 0
            ? "記事はまだありません。"
            : waiting
              ? "読み上げ・放送の印を読み込んでいます…"
              : "この絞り込みに合う記事はありません。"}
        </DeskEmpty>
      ) : (
        <>
          <div className="jb-card-grid" style={{ display: "grid", gridTemplateColumns: gridColumnsOf(cols, { autoMin: "min(260px, 100%)", floor: 160, gap: GRID_GAP }), gap: GRID_GAP }}>
            {rows.slice(0, shownCount).map((article) => {
              const readArtifacts = articleArtifactsOf(artifacts, article.slug);
              const card = cardOf(article);
              const publicTags = article.tags
                .filter((t) => t.visibility !== "internal" && !t.name.startsWith("#"))
                .map((t) => t.name)
                .join("・");
              return (
                <div key={article.id} style={{
                  position: "relative",
                  border: `1px solid ${JB.line}`,
                  background: JB.white,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}>
                  {/* カード全体を押すと記事ページへ（ユーザー指示 2026-10-13）。カードを覆う 1 本の
                      リンクにして、中の操作（印・編集・割付）だけを上に出す — リンクの中に
                      ボタンを入れない。素のリンクなので Ctrl/中ボタンで新しいタブにも開ける。 */}
                  <a
                    href={articleHrefOf(article)}
                    aria-label={`${article.title || "記事"}を開く`}
                    style={{ position: "absolute", inset: 0, zIndex: 1 }}
                  />
                  {/* 画像エリア 5:3（PostGridCard と同じ比率）。動画・音声はその場で再生するので、
                      エリアごとカードを覆うリンクより上に出す（再生しても記事へ行かない）。 */}
                  <div style={{
                    ...(card.type === "video" || card.type === "audio" ? ABOVE_CARD_LINK : {}),
                    position: "relative",
                    width: "100%",
                    aspectRatio: "5/3",
                    overflow: "hidden",
                    flexShrink: 0,
                    background: "#ece9e1",
                  }}>
                    {/* 種類は postTransform と同じ規則（本文の最初の素材、無ければ feature_image で
                        image、それも無ければ text）— `cardOf`。feature_image は動画・音声の絵になる。 */}
                    {card.type === "video" && card.media ? (
                      // 素材タブと共用の BigPlayVideo（GalleryAssetCard と同じ大きな ▶）
                      <BigPlayVideo src={card.media.url} poster={card.poster} />
                    ) : card.type === "audio" && card.media ? (
                      // 素材タブと同じ AudioCard（カードの中で再生）。feature_image があれば地の絵に敷く
                      // （AudioCard は絵を受けない）。
                      <div style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "flex-end",
                        padding: 8,
                        boxSizing: "border-box",
                        ...(card.poster ? { backgroundImage: `url("${card.poster}")`, backgroundSize: "cover", backgroundPosition: "center" } : { alignItems: "center" }),
                      }}>
                        <div style={{ width: "100%" }}>
                          <AudioCard src={card.media.url} title={article.title || "音声"} playOnHeaderClick />
                        </div>
                      </div>
                    ) : card.poster ? (
                      <img
                        src={card.poster}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      // 「絵なし」は種類が text の記事（素材が 1 つも無い。異常ではない）
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: JB.muted }}>絵なし</span>
                      </div>
                    )}
                    {/* 状態バッジ — 画像の上に重ねる */}
                    <div style={{ position: "absolute", top: 6, left: 6 }}>
                      <StateChip state={stateOf(article, now)} at={article.published_at} solid />
                    </div>
                    {/* 主役バッジ */}
                    {article.featured && (
                      <span style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        fontFamily: FONT_SANS,
                        fontSize: 10,
                        letterSpacing: "0.08em",
                        background: "rgba(0,0,0,0.72)",
                        color: "#fff",
                        padding: "2px 6px",
                      }}>主役</span>
                    )}
                  </div>

                  <div style={{ padding: "10px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    {/* 見出し */}
                    <div style={{ fontFamily: FONT_SERIF, fontSize: 14.5, lineHeight: 1.55, color: JB.ink, flex: 1 }}>
                      {article.title}
                    </div>

                    {/* メタ：面・媒体・公開日・紙面日・書き手 + 公開タグ */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "baseline" }}>
                      <ArticleMeta article={article} mediums={desk.mediums} />
                      <AuthorNames article={article} />
                      {publicTags !== "" && (
                        <span style={{ fontFamily: FONT_SANS, fontSize: 10.5, color: JB.muted }}>{publicTags}</span>
                      )}
                      {replacedOf(article, now) && (
                        <span style={{ fontFamily: FONT_SANS, fontSize: 10.5, color: JB.muted }}>差し替え</span>
                      )}
                    </div>

                    {/* 読み上げ・放送の印（voice または avatar が在るときだけ出す） */}
                    {readArtifacts && (readArtifacts.voice || readArtifacts.avatar) && (
                      <div style={ABOVE_CARD_LINK}><ArtifactIcons read={readArtifacts} /></div>
                    )}

                    {/* 操作ボタン */}
                    <div style={{
                      ...ABOVE_CARD_LINK,
                      display: "flex",
                      gap: 6,
                      justifyContent: "flex-end",
                      paddingTop: 4,
                      borderTop: `1px solid ${JB.line}`,
                    }}>
                      <EditLink postId={article.id} canEdit={canEditArticle(viewer, article)} />
                      <button
                        type="button"
                        disabled={!canPublish}
                        onClick={() => setWriting(article)}
                        title="面・媒体・主役・絵を決める"
                        style={{
                          fontFamily: FONT_SANS,
                          fontSize: 11.5,
                          border: `1px solid ${JB.line}`,
                          background: "transparent",
                          padding: "3px 10px",
                          cursor: canPublish ? "pointer" : "not-allowed",
                          opacity: canPublish ? 1 : 0.45,
                        }}
                      >割付</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {rows.length > shownCount && (
            <button
              type="button"
              onClick={() => setShownCount((n) => n + 50)}
              style={{
                fontFamily: FONT_SANS,
                fontSize: 12.5,
                marginTop: 12,
                border: `1px solid ${JB.line}`,
                background: "transparent",
                padding: "7px 14px",
                cursor: "pointer",
              }}
            >
              残り {rows.length - shownCount} 本を出す
            </button>
          )}
        </>
      )}

      {/* 「新しく書く」の 2 つ目の口 — 一覧を下まで見たところ（1 つ目は机の一番上・DeskTabBody）。
          ユーザー指示 2026-10-15。同じ部品なので開く 1 枚も同じ。 */}
      {desk.status === "ready" && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
          <NewArticleDialog faces={desk.faces} tags={desk.tags} mediums={desk.mediums} placement="bottom" />
        </div>
      )}

      {writing && (
        <WriteDialog
          article={writing}
          faces={desk.faces}
          mediums={desk.mediums}
          siblings={siblings}
          canPublish={canPublish}
          busy={busy}
          onClose={() => setWriting(null)}
          onWrite={async (patch) => {
            setBusy(true);
            await desk.write(writing, patch);
            setBusy(false);
          }}
        />
      )}
    </Panel>
  );
}

/** 1 行の枚数の好み（端末に残す。電子紙面・素材とは別の鍵）。 */
const COLUMNS_KEY = "jb-console-articles-columns";
/** 升目の間隔。列数の式と**同じ値**を使う — 片方だけ直すと最終行がずれる。 */
const GRID_GAP = 12;

/** カードを覆うリンクより上に出す（押せる物だけ）。素材タブのカードも同じ 1 つを使う。 */
export const ABOVE_CARD_LINK: React.CSSProperties = { position: "relative", zIndex: 2 };

/**
 * 記事カードの行き先 — 読者面の記事ページ。⚠ `/article` は Content API で読むので、
 * 下書き・予約の記事は「見つかりません」になる（2026-10-13 ユーザー指示で全カード同じ行き先。下書きの扱いは別途）。
 */
export const articleHrefOf = (article: Pick<DeskArticle, "id">): string =>
  `/article/${encodeURIComponent(article.id)}/`;
