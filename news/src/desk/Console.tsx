"use client";

import { useEffect, useMemo, useState } from "react";
import { useStaffSession } from "../adapter/NewsContext";
import { NEWS_EVENTS } from "../core";
import type { StackPageRuntimeApi } from "../reader/stackpage";
import { usePaperStyles } from "../shared/PaperStyles";
import ConsoleHeader from "./ConsoleHeader";
import MetricCards from "./MetricCards";
import { roleOf } from "./role";
import { TabBar, DeskError, DeskWriteError, type TabCount } from "./parts";
import ArticlesTab from "./ArticlesTab";
import NewArticleDialog from "./NewArticleDialog";
import AssetsTab from "./AssetsTab";
import ArtifactCardsTab, { articlesWithArtifact } from "./ArtifactCardsTab";
import { indexArticleArtifacts } from "../core";
import MediumsTab from "./MediumsTab";
import PaperTab from "./PaperTab";
import useDesk, { type Desk } from "./useDesk";
import useDeskTab from "./useDeskTab";
import usePostMedia, { type PostMediaState } from "./usePostMedia";
import { firstBodyMediaByPost, newsMediaRows, toMediaInfo, type PostMediaRow } from "./postMedia";
import type { DziEditions } from "../core";
import useDeskEditions from "./useDeskEditions";
import { useArticleArtifactJobs, type NewsJobRow } from "./useNewsJobs";
import {
  EMPTY_FILTER,
  tagMarkOf,
  todayPaperDay,
  type ArticleFilter,
  DESK_TABS,
  type DeskTabId,
  type DeskViewer,
} from "./model";

// /dashboard/news — 編集局の作業台。
//
// ログイン必須は app/dashboard/layout.tsx のセッションガードが担保する（ここでは追加しない）。
// ガードはセッション確定までの一瞬だけ中身を描くため、この画面は確定まで描かない。
//
// ロールはここで 1 回だけ解決して下へ配る。パネルごとに判定を書くと、
// 同じ人に違う見せ方が出る余地ができる（spec §5.2）。
//
// 読みは useDesk 1 か所。タブは props だけを受ける純描画なので、
// どのタブも同じ一覧・同じ面・同じ媒体を見る（タブごとに問い合わせない）。
export type ConsoleProps = {
  /** 出すタブ（Page Builder で一部だけ置くとき）。無ければ全部。 */
  tabs?: DeskTabId[];
  /** 最初に開くタブ。 */
  initialTab?: DeskTabId;
  /** `?tab=` で今のタブを持つか（同じページに机を複数置くなら false）。 */
  syncUrl?: boolean;
  /** 上の帯（題字と役割）を出すか。 */
  showHeader?: boolean;
  /** 上の帯の「読者面を見る」の行き先。 */
  readerHref?: string;
  /** 今日の紙面の数字を出すか。 */
  showMetrics?: boolean;
  /** タブの作業台を出すか（false なら帯と数字だけ = 要約）。 */
  showTabs?: boolean;
  /** 画面の高さいっぱいに敷くか（固定ページの机）。Page Builder の 1 タブ部品では false。 */
  fullHeight?: boolean;
  /** 「新しく書く」を出すか。 */
  showNewArticle?: boolean;
  /** タブを替えたとき { tab } を出すイベント。 */
  tabChangedEvent?: string;
  /** このイベント { tab } を受けたらタブを替える（メニューなど別の部品から操作する）。 */
  tabSelectEvent?: string;
  __stackpage?: StackPageRuntimeApi;
};

export default function Console({
  tabs,
  initialTab = "paper",
  syncUrl = true,
  showHeader = true,
  readerHref = "/home/news",
  showMetrics = true,
  showTabs = true,
  fullHeight = true,
  showNewArticle = true,
  tabChangedEvent = NEWS_EVENTS.deskTabChanged,
  tabSelectEvent = NEWS_EVENTS.deskTabSelect,
  __stackpage,
}: ConsoleProps = {}) {
  usePaperStyles();
  const { ready, userId, roles } = useStaffSession();
  const loaded = useDesk(ready);
  // 記事に付いた素材（post_media）。**全件はここで 1 回だけ読む** — 記事タブのカードの絵
  // （記事ごとの最初の素材）と素材タブの一覧が同じ行を使う。
  const allMedia = usePostMedia(ready, null);
  const firstMedia = useMemo(() => (allMedia.rows ? firstBodyMediaByPost(allMedia.rows) : null), [allMedia.rows]);
  // 机の一覧に「本文の最初の素材」を重ねる（読めるまでは重ねない = feature_image だけで判る分）。
  // カードの種類はこれで決まる（`cardOf`）。
  const articles = useMemo(
    () =>
      firstMedia === null
        ? loaded.articles
        : loaded.articles.map((article) => ({ ...article, bodyMedia: firstBodyMedia(firstMedia, article.id) })),
    [loaded.articles, firstMedia]
  );
  const desk: Desk = { ...loaded, articles };
  const allowed = useMemo(() => (tabs && tabs.length > 0 ? tabs : DESK_TABS.map((t) => t.id)), [tabs]);
  const [tab, setTab] = useDeskTab({ initial: initialTab, allowed, syncUrl });
  const selectTab = (id: DeskTabId) => {
    setTab(id);
    __stackpage?.emit?.(tabChangedEvent, { tab: id });
  };
  // 別の部品（メニュー・ボタン）からタブを替える。
  useEffect(() => {
    if (!__stackpage?.subscribe) return;
    return __stackpage.subscribe(tabSelectEvent, (payload) => {
      const next = String((payload as { tab?: unknown } | null)?.tab ?? "") as DeskTabId;
      if (next) setTab(next);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [__stackpage, tabSelectEvent]);

  const view = useMemo(
    () => roleOf(roles, desk.status === "ready" ? desk.faces.length : null),
    [roles, desk.status, desk.faces.length]
  );
  // 記事ごとに「編集」を押せるかを決める材料（`canEditArticle`）。ロールは名前に揃える。
  const viewer = useMemo<DeskViewer | null>(
    () =>
      ready
        ? {
            userId,
            roles: ((roles ?? []) as Array<{ name?: string } | string>).map((role) =>
              typeof role === "string" ? role : String(role?.name ?? "")
            ),
          }
        : null,
    [ready, userId, roles]
  );

  const now = new Date();

  // グローバルフィルタ — 記事・素材・放送の 3 タブで共有（電子紙面ではバー自体を出さない）。
  const [filter, setFilter] = useState<ArticleFilter>(EMPTY_FILTER);
  // 選んでいる紙面日。バーの中と電子紙面タブの中、2 か所に口（DayPicker 1 本）があるが
  // **持ち主はこの 1 つ** — タブを行き来しても日が変わらない。初期は当日。
  const [pickedDay, setPickedDay] = useState<string | null>(() => todayPaperDay(now));

  // 読み上げ/放送の印 — 記事・紙面・素材・放送の 4 タブで 1 回だけ読み、共有する。
  // **読者面と同じ軸**で読む（project では絞らない。理由は useNewsJobs.ts と newsReadIndex.ts の頭）。
  const { jobs: artifactJobs, note: artifactNote, selections: artifactSelections } = useArticleArtifactJobs();

  // 電子紙面の棚（DZI の完成ジョブ）。タブの数にも使うのでここで 1 回だけ読み、電子紙面タブへ渡す。
  // 窓は route の上限（100 面）。
  const editions = useDeskEditions(100);

  // タブの数（理由は deskTabCounts の頭）。
  const tabCounts = useMemo(
    () =>
      desk.status === "ready"
        ? deskTabCounts({ articles: desk.articles, tags: desk.tags, editions, mediaRows: allMedia.rows, artifactJobs, artifactSelections })
        : undefined,
    [desk.status, desk.articles, desk.tags, editions, allMedia.rows, artifactJobs, artifactSelections]
  );

  // フックはすべてこの上（早く抜ける前に呼ぶ — react-hooks/rules-of-hooks）。
  if (!ready) return null;

  return (
    <div style={{ background: "#f2efe8", minHeight: fullHeight ? "100vh" : undefined, paddingBottom: fullHeight ? "clamp(40px, 6vw, 72px)" : 12 }}>
      {showHeader && <ConsoleHeader
        roleLabel={view.label}
        scopeNote={view.scopeNote}
        status={desk.status === "error" ? "error" : desk.status === "ready" ? "ok" : undefined}
        readerHref={readerHref}
      />}

      {/* 版面（幅と左右余白）は .jb-wrap に集約している */}
      <div className="jb-wrap jb-console-wrap" style={{ paddingTop: "clamp(18px, 2.6vw, 30px)" }}>
        {showMetrics && (
          <div className="jb-console-gutter">
            <MetricCards status={desk.status} articles={desk.articles} now={now} />
          </div>
        )}

        {showTabs && (
        <div className="jb-console-frame" style={{ marginTop: "clamp(16px, 2vw, 22px)", border: "1px solid #d8d2c6", background: "#faf8f4" }}>
          {allowed.length > 1 && <TabBar value={tab} onChange={selectTab} counts={tabCounts} tabs={allowed} />}

          {/* グローバルフィルタバー（ConsoleFilterBar）は**どのタブにも出さない**。電子紙面は日と面が主役、
              記事・素材・読み上げ・放送はタブが自前のバーを持ち、媒体と紙面（タグの管理）には関係が無い
              （ユーザー指示 2026-10-14 で最後の 1 つ、媒体と紙面からも外した）。 */}

          <div className="jb-tab-body" style={{ padding: "clamp(14px, 2vw, 20px)" }}>
            {desk.status === "error" && <div style={{ marginBottom: 14 }}><DeskError message={desk.error ?? ""} /></div>}
            <DeskTabBody
              tab={tab}
              desk={desk}
              canPublish={view.canPublish}
              canManage={view.role === "admin"}
              viewer={viewer}
              allMedia={allMedia}
              editions={editions}
              now={now}
              filter={filter}
              onFilter={setFilter}
              pickedDay={pickedDay}
              onPickDay={setPickedDay}
              artifactJobs={artifactJobs}
              artifactSelections={artifactSelections}
              artifactNote={artifactNote}
              showNewArticle={showNewArticle}
            />
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

/**
 * タブの数。**どのタブもタブの中の「N／M」の M と同じ物を数える**（ユーザー指示 2026-10-15:
 * 数の出し方を揃える）。媒体と紙面だけは全タグ数でなく、タブの中の見出しと同じ「媒体 N・紙面 M」。まだ読めていない物は数を出さない（0 と「まだ」を混ぜない・V1）。
 *
 * 赤い札（下書き数・期限切れ数）は外した — 記事タブの数が下書き数に見えていた。
 * 予約の時刻を過ぎた記事は上の数字（MetricCards）が赤で出す。
 */
export function deskTabCounts({
  articles,
  tags,
  editions,
  mediaRows,
  artifactJobs,
  artifactSelections,
}: {
  articles: Desk["articles"];
  tags: Desk["tags"];
  editions: DziEditions;
  mediaRows: PostMediaRow[] | null;
  artifactJobs: NewsJobRow[] | null;
  artifactSelections: import("../core").NewsBroadcastSelection[];
}): Partial<Record<DeskTabId, TabCount>> {
  const counts: Partial<Record<DeskTabId, TabCount>> = {
    articles: articles.length,
    // 媒体と紙面は全タグ数ではなく、印の付いた数を内訳で（タブの中の見出し「媒体 1・紙面 9」と同じ）。
    mediums: [
      { label: "媒体", value: tags.filter((tag) => tagMarkOf(tag) === "medium").length },
      { label: "紙面", value: tags.filter((tag) => tagMarkOf(tag) === "face").length },
    ],
  };
  if (!editions.loading) counts.paper = editions.items.length;
  // 素材はニュース記事の分だけ（素材タブと同じ `newsMediaRows`）。
  if (mediaRows !== null) counts.assets = newsMediaRows(mediaRows, new Map(articles.map((a) => [a.id, a]))).length;
  if (artifactJobs !== null) {
    // 記事の数 — 同じ記事の作り直しは 1 つ。タブの中の「M 本」と同じ関数。
    const index = indexArticleArtifacts(artifactJobs, null, artifactSelections);
    counts.read = articlesWithArtifact(articles, index, "voice").length;
    counts.broadcast = articlesWithArtifact(articles, index, "avatar").length;
  }
  return counts;
}

// ---- グローバルフィルタバー --------------------------------------------------

/**
 * タブの中身。切り出してあるのは、押したときに何が出るかを試験で固定するため
 * （Console 自体はセッションと読みに依存していて、単体では描けない）。
 *
 * **書けなかった帯はここに置く。** 記事の書きは `PUT /posts/{id}/` の 1 本で、どのタブから
 * 押しても失敗は同じ意味なので、タブごとに置くと 1 つ書き忘れたタブだけ黙る。
 * ここに置けばどのタブも自動で継承する（PaperTab の中には置かない）。
 */
export function DeskTabBody({
  tab,
  desk,
  canPublish,
  canManage,
  now,
  filter,
  onFilter,
  pickedDay,
  onPickDay,
  artifactJobs,
  artifactSelections,
  artifactNote,
  viewer,
  allMedia,
  editions,
  showNewArticle = true,
}: {
  tab: DeskTabId;
  desk: Desk;
  canPublish: boolean;
  canManage: boolean;
  now: Date;
  filter: ArticleFilter;
  onFilter: (f: ArticleFilter) => void;
  pickedDay: string | null;
  onPickDay: (day: string | null) => void;
  artifactJobs: NewsJobRow[] | null;
  artifactSelections: import("../core").NewsBroadcastSelection[];
  artifactNote: string | null;
  viewer: DeskViewer | null;
  /** 全記事の素材（Console が 1 回読む）。素材タブの「記事：すべて」の一覧。 */
  allMedia: PostMediaState;
  /** 電子紙面の棚（Console が 1 回読む）。 */
  editions?: DziEditions;
  /** 「新しく書く」を出すか。 */
  showNewArticle?: boolean;
}) {
  return (
    <>
      {/* 「新しく書く」の 1 つ目の口 — 机の一番上（どのタブからでも押せる）。2 つ目は記事タブの一番下。
          ユーザー指示 2026-10-15。 */}
      {showNewArticle && desk.status === "ready" && (
        <div className="jb-console-gutter" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <NewArticleDialog faces={desk.faces} tags={desk.tags} mediums={desk.mediums} placement="top" />
        </div>
      )}
      {desk.writeError !== null && (
        <div className="jb-console-gutter" style={{ marginBottom: 14 }}>
          <DeskWriteError message={desk.writeError} onReload={desk.reload} />
        </div>
      )}
      {tab === "paper" ? (
        // 電子紙面は filter を受けない（バーを出さないタブで絞ると、隠れた条件で記事が
        // 消え、解除の口も無い。理由は PaperTab の頭）。日はタブの中の DayPicker が持つ。
        <PaperTab desk={desk} canPublish={canPublish} now={now} pickedDay={pickedDay} onPickDay={onPickDay} artifactJobs={artifactJobs} artifactSelections={artifactSelections} editions={editions} />
      ) : tab === "articles" ? (
        <ArticlesTab
          desk={desk}
          canPublish={canPublish}
          now={now}
          filter={filter}
          onFilter={onFilter}
          artifactJobs={artifactJobs}
          artifactSelections={artifactSelections}
          artifactNote={artifactNote}
          viewer={viewer}
        />
      ) : tab === "assets" ? (
        <AssetsTab desk={desk} now={now} viewer={viewer} allMedia={allMedia} />
      ) : tab === "read" || tab === "broadcast" ? (
        // 音声読み上げ / バーチャル放送（2026-10-14 に 1 タブを分けた）。絞り込みはタブ内に持つ。
        <ArtifactCardsTab
          key={tab}
          kind={tab === "read" ? "voice" : "avatar"}
          desk={desk}
          now={now}
          viewer={viewer}
          artifactJobs={artifactJobs}
          artifactSelections={artifactSelections}
        />
      ) : (
        // `mediums` はこれが最後のタブなので、ここが最後の else。
        <MediumsTab desk={desk} canManage={canManage} />
      )}
    </>
  );
}

/** 本文の最初の素材を共通の `MediaInfo` で。無ければ null（本文に素材の無い記事）。 */
function firstBodyMedia(first: Map<string, PostMediaRow>, postId: string) {
  const row = first.get(postId);
  return row ? toMediaInfo(row) : null;
}
