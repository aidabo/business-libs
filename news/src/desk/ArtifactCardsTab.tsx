"use client";

import { useMemo, useState } from "react";
import { FONT_SANS, FONT_SERIF, JB } from "../core";
import { articleArtifactsOf, indexArticleArtifacts } from "../core";
import { useNews } from "../adapter/NewsContext";
import type { NewsBroadcastSelection } from "../core";
import AudioCard from "./DeskAudio";
import Panel from "./Panel";
import { ABOVE_CARD_LINK, articleHrefOf } from "./ArticlesTab";
import { ColumnSelect, gridColumnsOf, useColumnChoice } from "./columns";
import DayPicker from "./DayPicker";
import BigPlayVideo from "../shared/BigPlayVideo";
import { ArticleMeta, AuthorNames, DeskEmpty, DeskError, EditLink, StateChip, editorLinkStyle } from "./parts";
import {
  EMPTY_CARD_FILTER,
  authorChoicesOf,
  canEditArticle,
  cardOf,
  isCardFilterActive,
  matchesCardFilter,
  stateOf,
  type CardFilter,
  type DeskArticle,
  type DeskViewer,
} from "./model";
import type { Desk } from "./useDesk";
import type { NewsJobRow } from "./useNewsJobs";

export type ArtifactKind = "voice" | "avatar";

const KIND = {
  voice: { title: "音声読み上げ", eyebrow: "READ", create: "音声を作る（ニュースエージェント）", columnsKey: "jb-console-read-columns", autoMin: "min(260px, 100%)", empty: "読み上げのある記事はまだありません。" },
  avatar: { title: "バーチャル放送", eyebrow: "BROADCAST", create: "バーチャル放送を作る（ニュースエージェント）", columnsKey: "jb-console-broadcast-columns", autoMin: "min(280px, 100%)", empty: "アバター放送のある記事はまだありません。" },
} as const;

/** 升目の間隔。列数の式と**同じ値**を使う — 片方だけ直すと最終行がずれる。 */
const GRID_GAP = 12;
const PAGE = 60;

/**
 * この種類の成果物を持つ記事（公開の新しい順）。**1 記事 1 行** — 同じ記事に作り直した成果物が
 * 何本あっても、索引が採った 1 本だけ（放送は selection → 旧 -avatar.mp4）。URL は索引が
 * artifactUrl で通した物だけ。タブの件数（Console）とタブの中の「N／M 本」はこれ 1 本で数える。
 */
export function articlesWithArtifact(
  articles: DeskArticle[],
  index: ReturnType<typeof indexArticleArtifacts>,
  kind: ArtifactKind,
): { article: DeskArticle; url: string }[] {
  const rows: { article: DeskArticle; url: string }[] = [];
  for (const article of articles) {
    const found = articleArtifactsOf(index, article.slug);
    const url = kind === "voice" ? found?.voice : found?.avatar;
    if (url) rows.push({ article, url });
  }
  const at = (a: DeskArticle) => a.published_at || a.updated_at || "";
  return rows.sort((a, b) => at(b.article).localeCompare(at(a.article)));
}

/**
 * 音声読み上げ / バーチャル放送のタブ（ユーザー指示 2026-10-14 で 1 タブを 2 つに分けた）。
 *
 * 上: 読者面（/home/news の「読み上げ」帯・/home/news/broadcast）と同じカード — 媒体・面・日付・
 * 題・作者と、その場で鳴らすプレーヤー（読み上げは AudioCard、放送は記事タブ・素材タブと
 * 共用の BigPlayVideo）。カードを押すと記事ページ（記事タブと同じ、カードを覆う 1 本のリンク）。
 * ジョブの中身（プロジェクト・ジョブカード・「読ませる」）は机に出さない（ユーザー指示 2026-10-14）。
 * 放送カードには、記事のアバターの成果物を「アバター」の口として並べる。
 *
 * 載せる記事と URL は**読者面と同じ索引**（`indexArticleArtifacts(artifactJobs, null,
 * artifactSelections)`）— 放送はその採用の規則（selection → 旧 -avatar.mp4）で選んだ 1 本。
 * 机と読者面で「有る / 無い」や流れる映像が食い違わない。
 *
 * 絞り込みはタブ内に持つ（記事タブと同じ並び + 作者。グローバルフィルタバーは出さない）。
 */
export default function ArtifactCardsTab({
  kind,
  desk,
  now,
  viewer,
  artifactJobs,
  artifactSelections,
}: {
  kind: ArtifactKind;
  desk: Desk;
  now: Date;
  viewer: DeskViewer | null;
  artifactJobs: NewsJobRow[] | null;
  artifactSelections: NewsBroadcastSelection[];
}) {
  const { openAssistant } = useNews().adapter;
  const conf = KIND[kind];
  const [filter, setFilter] = useState<CardFilter>(EMPTY_CARD_FILTER);
  const [shownCount, setShownCount] = useState(PAGE);
  // 1 行の枚数。**絞りではない**ので CardFilter に入れない（「解除」で見え方まで跳ばない）。
  const [cols, setCols] = useColumnChoice(conf.columnsKey, "auto");

  const index = useMemo(() => indexArticleArtifacts(artifactJobs, null, artifactSelections), [artifactJobs, artifactSelections]);
  const withArtifact = useMemo(() => articlesWithArtifact(desk.articles, index, kind), [desk.articles, index, kind]);
  const cards = useMemo(
    () => withArtifact.filter(({ article }) => matchesCardFilter(article, filter, now)),
    [withArtifact, filter, now]
  );
  const authors = useMemo(() => authorChoicesOf(withArtifact.map((row) => row.article)), [withArtifact]);

  const fieldStyle: React.CSSProperties = {
    padding: "4px 7px",
    border: `1px solid ${JB.line}`,
    background: "#fff",
    fontFamily: FONT_SANS,
    fontSize: 12,
    maxWidth: "100%",
  };
  const set = (patch: Partial<CardFilter>) => {
    setFilter({ ...filter, ...patch });
    setShownCount(PAGE);
  };

  if (desk.status === "error") {
    return (
      <Panel title={conf.title} eyebrowText={conf.eyebrow}>
        <DeskError message={desk.error ?? ""} />
      </Panel>
    );
  }

  return (
    <Panel
      title={conf.title}
      eyebrowText={conf.eyebrow}
      right={
        <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {desk.status === "ready" && artifactJobs !== null && (
            <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: JB.muted }}>
              {cards.length}／{withArtifact.length} 本
            </span>
          )}
          {/* 作るのはニュースエージェント（AI パネルの news）。机はジョブを出さないので、作る口へ送る。
              記事タブの「新しく書く」と同じ見た目。 */}
          <button
            type="button"
            onClick={() => openAssistant?.("news")}
            style={{ ...editorLinkStyle, background: "transparent", cursor: "pointer" }}
          >
            {conf.create}
          </button>
        </div>
      }
    >
      {/* タブ内フィルターバー（記事タブと同じ並び: 絞り → 列 → 解除 → 右端に検索） */}
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

        <select value={filter.state} onChange={(e) => set({ state: e.target.value as CardFilter["state"] })} aria-label="記事の状態" style={fieldStyle}>
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

        <select value={filter.author} onChange={(e) => set({ author: e.target.value })} aria-label="作者" style={{ ...fieldStyle, maxWidth: 200 }}>
          <option value="">作者：すべて</option>
          {authors.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <ColumnSelect value={cols} onChange={setCols} style={fieldStyle} />

        {isCardFilterActive(filter) && (
          <button
            type="button"
            onClick={() => set(EMPTY_CARD_FILTER)}
            style={{ fontFamily: FONT_SANS, fontSize: 11.5, border: `1px solid ${JB.line}`, background: "transparent", padding: "4px 10px", cursor: "pointer", color: JB.muted }}
          >
            解除
          </button>
        )}

        <input
          type="search"
          value={filter.word}
          onChange={(e) => set({ word: e.target.value })}
          placeholder="題・本文で検索"
          aria-label={`${conf.title}を検索`}
          style={{ ...fieldStyle, width: 180, marginLeft: "auto" }}
        />
      </div>

      {desk.status !== "ready" || artifactJobs === null ? (
        // 「まだ」と「無い」を混ぜない（V1）— 索引が着くまで 0 件とは言わない。
        <DeskEmpty>読み込んでいます…</DeskEmpty>
      ) : withArtifact.length === 0 ? (
        <DeskEmpty>{conf.empty}</DeskEmpty>
      ) : cards.length === 0 ? (
        <DeskEmpty>この絞り込みに合う記事はありません。</DeskEmpty>
      ) : (
        <>
          <div className="jb-card-grid" style={{ display: "grid", gridTemplateColumns: gridColumnsOf(cols, { autoMin: conf.autoMin, floor: 160, gap: GRID_GAP }), gap: GRID_GAP }}>
            {cards.slice(0, shownCount).map(({ article, url }) => (
              <ArtifactCard
                key={article.id}
                kind={kind}
                article={article}
                url={url}
                desk={desk}
                now={now}
                canEdit={canEditArticle(viewer, article)}
              />
            ))}
          </div>
          {cards.length > shownCount && (
            <button
              type="button"
              onClick={() => setShownCount((n) => n + PAGE)}
              style={{ fontFamily: FONT_SANS, fontSize: 12.5, marginTop: 12, border: `1px solid ${JB.line}`, background: "transparent", padding: "7px 14px", cursor: "pointer" }}
            >
              残り {cards.length - shownCount} 本を出す
            </button>
          )}
        </>
      )}

    </Panel>
  );
}

/**
 * カード 1 枚。読者面のカード（ListenBand / AvatarBroadcastBand）と同じ並び: プレーヤー → 面・日付 →
 * 題。机ではそこに媒体・作者・「編集」を足す。プレーヤーと「編集」はカードを覆うリンクより上
 * （`ABOVE_CARD_LINK`）— 鳴らしても記事へ行かない。残りを押すと記事ページ。
 */
function ArtifactCard({
  kind,
  article,
  url,
  desk,
  now,
  canEdit,
}: {
  kind: ArtifactKind;
  article: DeskArticle;
  url: string;
  desk: Desk;
  now: Date;
  canEdit: boolean;
}) {
  const title = article.title || "（題なし）";
  return (
    <article style={{ position: "relative", minWidth: 0, background: JB.white, border: `1px solid ${JB.line}`, display: "flex", flexDirection: "column" }}>
      <a href={articleHrefOf(article)} aria-label={`${title}を開く`} style={{ position: "absolute", inset: 0, zIndex: 1 }} />
      <div style={{ ...ABOVE_CARD_LINK, padding: kind === "voice" ? 8 : 0 }}>
        {kind === "avatar" ? (
          // 放送の映像（読者面と同じ 16:9）。poster は記事の絵（カードの規則 cardOf）。
          <div style={{ width: "100%", aspectRatio: "16 / 9", background: JB.paperDeep }}>
            <BigPlayVideo src={url} poster={cardOf(article).poster} />
          </div>
        ) : (
          <AudioCard src={url} title="読み上げ" playOnHeaderClick />
        )}
      </div>
      <div style={{ padding: "8px 10px 10px", display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "baseline" }}>
          <StateChip state={stateOf(article, now)} at={article.published_at} />
          <ArticleMeta article={article} mediums={desk.mediums} />
        </div>
        <div style={{ fontFamily: FONT_SERIF, fontSize: 15, lineHeight: 1.5, color: JB.ink, flex: 1 }}>{title}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          <AuthorNames article={article} />
        </div>
        <div style={{ ...ABOVE_CARD_LINK, display: "flex", justifyContent: "flex-end", paddingTop: 4, borderTop: `1px solid ${JB.line}` }}>
          <EditLink postId={article.id} canEdit={canEdit} />
        </div>
      </div>
    </article>
  );
}
