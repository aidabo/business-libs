import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  BAND_LIMIT,
  DEFAULT_ORDER,
  FONT_SANS,
  JB,
  NEWS_EVENTS,
  NEWS_STATE_KEYS,
  activeTags,
  flashIds,
  frontPageIds,
  isBoardFiltered,
  newestFirst,
  selectFlash,
  selectFrontPage,
  type Face,
  type NewsAudioEntry,
  type NewsPost,
  type NewsPresenter,
  type PaperEdition,
} from "../core";
import { useNewsAudioCtx, useRegisterAudio } from "../shared/NewsAudioContext";
import { usePaperStyles } from "../shared/PaperStyles";
import ArticleCell from "./ArticleCell";
import AskPanel from "./AskPanel";
import AudioBar from "./AudioBar";
import AvatarBroadcastBand from "./AvatarBroadcastBand";
import FaceBoard from "./FaceBoard";
import FlashBand from "./FlashBand";
import FrontPage from "./FrontPage";
import GuestPromo from "./GuestPromo";
import ListenBand from "./ListenBand";
import Masthead from "./Masthead";
import FooterImprint from "./NewsFooter";
import NewsToolbar from "./NewsToolbar";
import PaperPreview from "./PaperPreview";
import SubscriptionBand from "./SubscriptionBand";
import { IMPRINT, SUBSCRIPTION } from "./content";
import { asArray, getPageState, setPageState, type StackPageRuntimeApi } from "./stackpage";
import { DEFAULT_NEWS_LINK, NewsLinkProvider, type NewsArticleDestination } from "../shared/NewsLink";

// News Studio の読者面の部品（/home/news を Page Builder で組むための単位）。
//
// ── データ ───────────────────────────────────────────────────────────
// 記事・面・紙面・話者・読み上げはすべて props で受ける — ページの `host-news-*`
// データソースに結び付ける（__bindings）。部品は取りに行かない。
//
// ── 部品どうしの約束 ──────────────────────────────────────────────────
// 固定ページは 1 つの部品の中で「第一面に出した記事を速報・面立てから除く」をしていた。
// ここでは各部品が**同じ記事の配列**から同じ純関数（selectFrontPage / selectFlash）で
// 計算し直すので、結び付け先が同じなら結果も同じになる（重複しない）。
//
// 面の絞り込み・検索・並びは page state（NEWS_STATE_KEYS）に置く。NewsFaceToolbar が書き、
// 絞り込み結果はデータソース `host-news-posts-public` が {{state.news.*}} で受けて返す。

type WithStackPage = { __stackpage?: StackPageRuntimeApi; isEditing?: boolean };

/**
 * 記事を押したときの行き先とイベント（common の PostGridCard と同じ名前の props）。
 * 押すと selectedPostStateKey に postId を書き、selectEvent を { postId, id, title, url } で出してから移る。
 */
type WithLink = WithStackPage & {
  /** "article" = /article/{id}/、"page" = Page Builder のページ（?postId=）、"selection" = 移らない */
  cardClickDestination?: NewsArticleDestination;
  cardClickPageId?: string;
  cardClickPageQueryKey?: string;
  selectEvent?: string;
  selectedPostStateKey?: string;
};
type WithAudio = {
  /** 読み上げ・放送の一覧（`host-news-audio-public`）。受けた部品がページの再生 store に登録する。 */
  audio?: NewsAudioEntry[];
};

/** 部品の外枠。紙面のスタイルを head に 1 度だけ入れ、版面の幅（jb-wrap）で包む。 */
function NewsFrame({ children, wrap = true, link }: { children: ReactNode; wrap?: boolean; link?: WithLink }) {
  usePaperStyles();
  const options = {
    destination: link?.cardClickDestination ?? DEFAULT_NEWS_LINK.destination,
    pageId: link?.cardClickPageId ?? "",
    pageQueryKey: link?.cardClickPageQueryKey || DEFAULT_NEWS_LINK.pageQueryKey,
    selectEvent: link?.selectEvent || DEFAULT_NEWS_LINK.selectEvent,
    selectedPostStateKey: link?.selectedPostStateKey ?? DEFAULT_NEWS_LINK.selectedPostStateKey,
    stackpage: link?.__stackpage,
    isEditing: link?.isEditing,
  };
  return (
    <NewsLinkProvider value={options}>
    <div className="jb-news" style={{ background: JB.paper }}>
      {wrap ? (
        // 中身が出ない日（記事が無い・案内の対象でない）は、空の枠を残さない（PaperStyles の
        // .jb-frame-wrap:empty）。
        <div className="jb-wrap jb-frame-wrap" style={{ paddingTop: 12, paddingBottom: 12 }}>
          {children}
        </div>
      ) : (
        children
      )}
    </div>
    </NewsLinkProvider>
  );
}

const usePosts = (value: unknown) => asArray<NewsPost>(value);

/** 第一面に出た記事と速報に出た記事（面立てから除く）。 */
const usedOnTop = (posts: NewsPost[]) => {
  const front = frontPageIds(selectFrontPage(posts));
  const flash = flashIds(selectFlash(posts, front, 5));
  return { front, flash };
};

type BoardKeys = {
  facesStateKey?: string;
  keywordStateKey?: string;
  filterEvent?: string;
  searchEvent?: string;
};

/**
 * page state の絞り込み（面・語）。描画のたびに読むうえ、絞り込みのイベントでも読み直す
 * （state の変化が届かない並びでも、イベントで確実に入れ替わる — PostGridCard と同じ）。
 */
const useBoardState = (stackpage: StackPageRuntimeApi | undefined, keys: BoardKeys = {}) => {
  const facesKey = keys.facesStateKey || NEWS_STATE_KEYS.faces;
  const keywordKey = keys.keywordStateKey || NEWS_STATE_KEYS.keyword;
  const [, bump] = useState(0);
  useEffect(() => {
    if (!stackpage?.subscribe) return;
    const offs = [
      stackpage.subscribe(keys.filterEvent || NEWS_EVENTS.filterChanged, () => bump((n) => n + 1)),
      stackpage.subscribe(keys.searchEvent || NEWS_EVENTS.searchChanged, () => bump((n) => n + 1)),
    ];
    return () => offs.forEach((off) => off?.());
  }, [stackpage, keys.filterEvent, keys.searchEvent]);
  const faces = getPageState<unknown>(stackpage, facesKey, "");
  const keyword = getPageState<unknown>(stackpage, keywordKey, "");
  return { faces, keyword, filtered: isBoardFiltered(faces, keyword) };
};

// ── 題字 ───────────────────────────────────────────────────────────────

export function NewsMasthead({
  paperName = "",
  paperNameEn = "",
  demoNote = IMPRINT.demoNote,
  showNav = true,
  navBase = "",
  audio,
}: WithAudio & {
  paperName?: string;
  paperNameEn?: string;
  demoNote?: string;
  showNav?: boolean;
  /** 面ナビの飛び先の前置き（別ページから紙面のアンカーへ送るとき。例 `/home/news`）。 */
  navBase?: string;
}) {
  useRegisterAudio(audio);
  const { hasVoice, hasAvatar } = useNewsAudioCtx();
  return (
    <NewsFrame wrap={false}>
      <Masthead
        listen={hasVoice}
        broadcast={hasAvatar}
        base={navBase}
        paperName={paperName}
        paperNameEn={paperNameEn}
        demoNote={demoNote}
        showNav={showNav}
      />
    </NewsFrame>
  );
}

// ── 第一面・速報 ────────────────────────────────────────────────────────

export function NewsFrontPage({ posts, audio, ...link }: WithAudio & WithLink & { posts?: NewsPost[] }) {
  useRegisterAudio(audio);
  const list = usePosts(posts);
  if (list.length === 0) return null;
  return (
    <NewsFrame link={link}>
      <FrontPage posts={list} />
    </NewsFrame>
  );
}

export function NewsFlashBand({ posts, ...link }: WithLink & { posts?: NewsPost[] }) {
  const list = usePosts(posts);
  if (list.length === 0) return null;
  return (
    <NewsFrame link={link}>
      <FlashBand posts={list} excludeIds={usedOnTop(list).front} />
    </NewsFrame>
  );
}

// ── バーチャル放送 ─────────────────────────────────────────────────────

export function NewsBroadcastBand({
  posts,
  audio,
  limit = BAND_LIMIT,
  moreHref = "/home/news/broadcast",
}: WithAudio & { posts?: NewsPost[]; limit?: number; moreHref?: string }) {
  useRegisterAudio(audio);
  const { avatarOf } = useNewsAudioCtx();
  const all = newestFirst(usePosts(posts).filter((post) => avatarOf(post) !== null));
  if (all.length === 0) return null;
  return (
    <NewsFrame>
      <AvatarBroadcastBand
        posts={all.slice(0, Math.max(1, limit))}
        avatarOf={avatarOf}
        moreHref={moreHref && all.length > limit ? moreHref : null}
      />
    </NewsFrame>
  );
}

/** 放送の一覧（/home/news/broadcast 相当）。本数で切らない。 */
export function NewsBroadcastList({
  posts,
  audio,
  emptyText = "バーチャル放送はまだありません。",
}: WithAudio & { posts?: NewsPost[]; emptyText?: string }) {
  useRegisterAudio(audio);
  const { avatarOf, enabled } = useNewsAudioCtx();
  const all = newestFirst(usePosts(posts).filter((post) => avatarOf(post) !== null));
  return (
    <NewsFrame>
      {all.length > 0 ? (
        <AvatarBroadcastBand posts={all} avatarOf={avatarOf} />
      ) : enabled ? (
        <p style={{ fontFamily: FONT_SANS, fontSize: 15, lineHeight: 2, color: JB.muted, margin: 0 }}>{emptyText}</p>
      ) : null}
    </NewsFrame>
  );
}

// ── 面の絞り込み・検索（フィルタメニュー） ─────────────────────────────────

/**
 * 面のタブ・検索語・並び（フィルタメニュー）。common の PostSearchBar / TagFilterBar と同じ型:
 * 値は**コードで page state に直接書き**（データソース `{{state.news.*}}` の引き直しはこれで起きる）、
 * あわせて契約イベントを出す。既定の __interactions にも同じ書き込みの規則を載せてあるので、
 * 配線は Page Builder の ⚡ Page Events / Event タブで見える・変えられる。
 *
 * - 面:   facesStateKey（既定 news.filter.faces、カンマ区切り）／ filterEvent { faces, face, active }
 * - 語:   keywordStateKey（既定 news.search.keyword）／ searchEvent { keyword }（打つのが止まって 300ms 後）
 * - 並び: orderStateKey（既定 news.sort.order）／ sortEvent { order }
 */
export function NewsFaceToolbar({
  faces,
  facesStateKey = NEWS_STATE_KEYS.faces,
  keywordStateKey = NEWS_STATE_KEYS.keyword,
  orderStateKey = NEWS_STATE_KEYS.order,
  filterEvent = NEWS_EVENTS.filterChanged,
  searchEvent = NEWS_EVENTS.searchChanged,
  sortEvent = NEWS_EVENTS.sortChanged,
  __stackpage,
}: WithStackPage & {
  faces?: Face[];
  facesStateKey?: string;
  keywordStateKey?: string;
  orderStateKey?: string;
  filterEvent?: string;
  searchEvent?: string;
  sortEvent?: string;
}) {
  const faceList = asArray<Face>(faces);
  const [selected, setSelected] = useState<string[]>(() => activeTags(getPageState(__stackpage, facesStateKey, "")));
  const [keyword, setKeyword] = useState<string>(() => String(getPageState(__stackpage, keywordStateKey, "") ?? ""));
  const [order, setOrder] = useState<string>(
    () => String(getPageState(__stackpage, orderStateKey, "") ?? "") || DEFAULT_ORDER,
  );
  const committedKeyword = useRef(keyword.trim());

  // 打つたびにデータソースを引き直さない（語は 300ms 止まってから書く）。
  useEffect(() => {
    const next = keyword.trim();
    if (next === committedKeyword.current) return;
    const timer = setTimeout(() => {
      committedKeyword.current = next;
      setPageState(__stackpage, keywordStateKey, next);
      __stackpage?.emit?.(searchEvent, { keyword: next });
    }, 300);
    return () => clearTimeout(timer);
  }, [__stackpage, keyword, keywordStateKey, searchEvent]);

  const writeFaces = (next: string[], face: string) => {
    setSelected(next);
    const value = next.join(",");
    setPageState(__stackpage, facesStateKey, value);
    __stackpage?.emit?.(filterEvent, { faces: value, face, active: next.includes(face) });
  };

  return (
    <NewsFrame>
      <section id="faces" className="jb-news-section">
        <NewsToolbar
          faces={faceList}
          selectedFaces={selected}
          keyword={keyword}
          order={order}
          onToggleTag={(label) =>
            writeFaces(selected.includes(label) ? selected.filter((face) => face !== label) : [...selected, label], label)
          }
          onKeyword={setKeyword}
          onOrder={(next) => {
            setOrder(next);
            setPageState(__stackpage, orderStateKey, next);
            __stackpage?.emit?.(sortEvent, { order: next });
          }}
          onReset={() => {
            writeFaces([], "");
            setKeyword("");
          }}
        />
      </section>
    </NewsFrame>
  );
}

/**
 * 絞り込み結果の一覧。`posts` は `host-news-posts-public` に {{state.news.*}} を渡したもの。
 * 既定では面か語が入っているときだけ出す（入っていなければ NewsFaceBoard の番）。
 */
export function NewsArticleGrid({
  posts,
  audio,
  showWhen = "filtered",
  emptyText = "この条件に合う記事はありません。",
  facesStateKey,
  keywordStateKey,
  filterEvent,
  searchEvent,
  ...link
}: WithAudio &
  WithLink &
  BoardKeys & {
    posts?: NewsPost[];
    /** "filtered" = 絞り込み中だけ出す / "always" = 常に出す。 */
    showWhen?: "filtered" | "always";
    emptyText?: string;
  }) {
  useRegisterAudio(audio);
  const list = usePosts(posts);
  const { filtered } = useBoardState(link.__stackpage, { facesStateKey, keywordStateKey, filterEvent, searchEvent });
  if (showWhen === "filtered" && !filtered) return null;
  return (
    <NewsFrame link={link}>
      {list.length === 0 ? (
        <p style={{ fontFamily: FONT_SANS, fontSize: 15, color: JB.muted, margin: 0 }}>{emptyText}</p>
      ) : (
        <>
          <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: JB.muted, margin: "0 0 12px" }}>{list.length} 件</p>
          <div className="jb-result-grid">
            {list.map((post) => (
              <ArticleCell key={post.id} post={post} showFace />
            ))}
          </div>
        </>
      )}
    </NewsFrame>
  );
}

/**
 * 面立て（面ごとの記事の列）。`posts` は絞り込まない全件。第一面と速報に出た記事は除く。
 * 既定では絞り込み中は隠れる（NewsArticleGrid と入れ替わる）。
 */
export function NewsFaceBoard({
  posts,
  faces,
  audio,
  hideWhenFiltered = true,
  facesStateKey,
  keywordStateKey,
  filterEvent,
  searchEvent,
  ...link
}: WithAudio & WithLink & BoardKeys & { posts?: NewsPost[]; faces?: Face[]; hideWhenFiltered?: boolean }) {
  useRegisterAudio(audio);
  const list = usePosts(posts);
  const { filtered } = useBoardState(link.__stackpage, { facesStateKey, keywordStateKey, filterEvent, searchEvent });
  if (hideWhenFiltered && filtered) return null;
  if (list.length === 0) return null;
  const used = usedOnTop(list);
  return (
    <NewsFrame link={link}>
      <FaceBoard posts={list} faces={asArray<Face>(faces)} excludeIds={[...used.front, ...used.flash]} />
    </NewsFrame>
  );
}

// ── 読み上げ・紙面・購読・AI・案内 ─────────────────────────────────────

export function NewsListenBand({
  posts,
  audio,
  limit = BAND_LIMIT,
  moreHref = "/home/news/listen",
  ...link
}: WithAudio & WithLink & { posts?: NewsPost[]; limit?: number | null; moreHref?: string }) {
  useRegisterAudio(audio);
  const list = usePosts(posts);
  if (list.length === 0) return null;
  return (
    <NewsFrame link={link}>
      <ListenBand posts={list} limit={limit} moreHref={moreHref || null} />
    </NewsFrame>
  );
}

export function NewsPaperPreview({
  posts,
  editions,
  viewerHref = "/deepzoom/",
}: {
  posts?: NewsPost[];
  editions?: PaperEdition[];
  viewerHref?: string;
}) {
  const list = usePosts(posts);
  if (list.length === 0) return null;
  return (
    <NewsFrame>
      <PaperPreview posts={list} editions={asArray<PaperEdition>(editions)} viewerHref={viewerHref} />
    </NewsFrame>
  );
}

export function NewsSubscriptionBand({
  heading = SUBSCRIPTION.heading,
  body = SUBSCRIPTION.body,
  singleNote = SUBSCRIPTION.singleNote,
  primaryLabel = SUBSCRIPTION.primaryLabel,
  singleLabel = SUBSCRIPTION.singleLabel,
  href = SUBSCRIPTION.href,
}: Partial<typeof SUBSCRIPTION>) {
  return (
    <NewsFrame>
      <SubscriptionBand copy={{ heading, body, singleNote, primaryLabel, singleLabel, href }} />
    </NewsFrame>
  );
}

export function NewsAskPanel({
  presenters,
  askGuest = IMPRINT.askGuest,
  ...link
}: WithLink & {
  presenters?: NewsPresenter[];
  askGuest?: string;
}) {
  return (
    <NewsFrame link={link}>
      <AskPanel presenters={asArray<NewsPresenter>(presenters)} askGuest={askGuest} />
    </NewsFrame>
  );
}

/** ログインしていない人にだけ出す案内（見ている人が分かるまでは出さない）。 */
export function NewsGuestPromo({
  posts,
  presenters,
  editions,
  audio,
}: WithAudio & { posts?: NewsPost[]; presenters?: NewsPresenter[]; editions?: PaperEdition[] }) {
  useRegisterAudio(audio);
  const list = usePosts(posts);
  if (list.length === 0) return null;
  return (
    <NewsFrame>
      <GuestPromo
        posts={list}
        presenters={asArray<NewsPresenter>(presenters)}
        editions={asArray<PaperEdition>(editions)}
      />
    </NewsFrame>
  );
}

export function NewsFooter({
  faces,
  publisher = IMPRINT.publisher,
  membershipNote = IMPRINT.membershipNote,
  platformNote = IMPRINT.platformNote,
  demoNote = IMPRINT.demoNote,
}: {
  faces?: Face[];
  publisher?: string;
  membershipNote?: string;
  platformNote?: string;
  demoNote?: string;
}) {
  return (
    <NewsFrame wrap={false}>
      <FooterImprint
        faces={asArray<Face>(faces)}
        publisher={publisher}
        membershipNote={membershipNote}
        platformNote={platformNote}
        demoNote={demoNote}
      />
    </NewsFrame>
  );
}

/** 画面の下に貼り付く読み上げの帯。ふつうはこれに `host-news-audio-public` を結び付ける。 */
export function NewsAudioBar({ audio }: WithAudio) {
  useRegisterAudio(audio);
  usePaperStyles();
  return (
    <div className="jb-news">
      <AudioBar />
    </div>
  );
}
