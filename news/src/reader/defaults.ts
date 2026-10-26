import { BAND_LIMIT, NEWS_EVENTS, NEWS_STATE_KEYS, NEWS_TOOLBAR_INTERACTIONS, type Face, type NewsPost } from "../core";
import { IMPRINT, SUBSCRIPTION } from "./content";

// Page Builder の既定値（_componentDesc・__schema・見本データ）。
// 見本は「置いた瞬間に形が分かる」ためのもの — 実データはデータソースに結び付けて受ける
// （結び付けた値が見本より優先される）。見本に実在の画像 URL は使わない（絵は空）。

const NOW = "2026-10-25T09:00:00.000+09:00";

const faceTag = (label: string, slug: string) => ({
  id: `sample-face-${slug}`,
  name: `#${label}面`,
  slug,
  classification: "face",
});

const SAMPLE_FACE_TAGS = [faceTag("政治", "hash-politics"), faceTag("経済", "hash-economy"), faceTag("社会", "hash-society")];

const samplePost = (
  id: string,
  title: string,
  face: number,
  hoursAgo: number,
  extra: Partial<NewsPost> = {},
): NewsPost => {
  const published = new Date(new Date(NOW).getTime() - hoursAgo * 3600_000).toISOString();
  return {
    id,
    uuid: id,
    type: "text",
    src: null,
    displayUrl: null,
    title,
    slug: id,
    html: null,
    lexical: "",
    feature_image: null,
    featured: false,
    status: "published",
    visibility: "public",
    created_at: published,
    updated_at: published,
    published_at: published,
    excerpt: "見本の記事です。データソース（ニュース記事 — 一覧）に結び付けると実際の記事に置き換わります。",
    related_date: null,
    related_events: null,
    reading_time: 2,
    group_id: null,
    tags: [SAMPLE_FACE_TAGS[face]],
    count: { bookmarks: 0, favors: 0, forwards: 0, comments: 0, clicks: 0, positive_feedback: 0, negative_feedback: 0 },
    primary_author: { id: "sample-author", name: "編集局", slug: "desk", profile_image: null, url: "" },
    primary_tag: { id: SAMPLE_FACE_TAGS[face].id, name: SAMPLE_FACE_TAGS[face].name, slug: SAMPLE_FACE_TAGS[face].slug, feature_image: null, url: "" },
    url: `/article/${id}`,
    ...extra,
  } as NewsPost;
};

export const SAMPLE_POSTS: NewsPost[] = [
  samplePost("sample-lead", "見本: 本日の主要ニュースの見出し", 0, 1, { featured: true }),
  samplePost("sample-2", "見本: 経済面の記事の見出し", 1, 2),
  samplePost("sample-3", "見本: 社会面の記事の見出し", 2, 3),
  samplePost("sample-4", "見本: 政治面の続報の見出し", 0, 4),
  samplePost("sample-5", "見本: 経済面の速報の見出し", 1, 5),
];

export const SAMPLE_FACES: Face[] = [
  { slug: "hash-politics", label: "政治", order: 0 },
  { slug: "hash-economy", label: "経済", order: 1 },
  { slug: "hash-society", label: "社会", order: 2 },
];

// ── __schema の部品 ──────────────────────────────────────────────────

const arrayProp = (title: string) => ({
  type: "array",
  title,
  items: { type: "object" },
  "x-array-binding": true,
});
const text = (title: string) => ({ type: "string", title });
const longText = (title: string) => ({ type: "string", title, "x-widget": "textarea" });
const int = (title: string, minimum = 1) => ({ type: "integer", title, minimum });

const POSTS = arrayProp("記事（ニュース記事 — 一覧）");
const AUDIO = arrayProp("読み上げ・放送（読み上げ・放送 — 一覧）");
const FACES = arrayProp("面（ニュースの面 — 一覧）");
const EDITIONS = arrayProp("電子紙面（電子紙面 — 一覧）");
const PRESENTERS = arrayProp("話者（放送の話者 — 一覧）");

const schema = (title: string, properties: Record<string, unknown>) => ({ type: "object", title, properties });

// 記事を押したときの行き先とイベント（common の PostGridCard と同じ名前）。
const LINK_DEFAULTS = {
  cardClickDestination: "article",
  cardClickPageId: "",
  cardClickPageQueryKey: "postId",
  selectEvent: NEWS_EVENTS.postSelected,
  selectedPostStateKey: NEWS_STATE_KEYS.selectedPostId,
};
const LINK_SCHEMA = {
  cardClickDestination: {
    type: "string",
    title: "記事を押したときの行き先",
    enum: ["article", "page", "selection"],
    description: "article = 記事ページ / page = 下のページ（PostView で読む） / selection = 移らずイベントだけ",
  },
  cardClickPageId: text("行き先のページ ID（page のとき）"),
  cardClickPageQueryKey: text("ページへ渡す記事 ID のキー（既定 postId）"),
  selectEvent: { type: "string", title: "選択イベント", description: "{ postId, id, title, url } を出す" },
  selectedPostStateKey: text("選んだ記事 ID を書く page state"),
};

// 絞り込みの読み手（結果一覧・面立て）。ツールバーと同じ値にすること。
const BOARD_DEFAULTS = {
  facesStateKey: NEWS_STATE_KEYS.faces,
  keywordStateKey: NEWS_STATE_KEYS.keyword,
  filterEvent: NEWS_EVENTS.filterChanged,
  searchEvent: NEWS_EVENTS.searchChanged,
};
const BOARD_SCHEMA = {
  facesStateKey: text("面の page state"),
  keywordStateKey: text("検索語の page state"),
  filterEvent: text("面の絞り込みイベント"),
  searchEvent: text("検索イベント"),
};

const desc = (name: string) => `component.${name}.desc`;

export const NewsDefaultProps: Record<string, Record<string, unknown>> = {
  NewsMasthead: {
    _componentDesc: desc("NewsMasthead"),
    paperName: "",
    paperNameEn: "",
    demoNote: IMPRINT.demoNote,
    showNav: true,
    navBase: "",
    audio: [],
    __schema: schema("NewsMasthead", {
      paperName: text("紙名（空ならテナントの設定）"),
      paperNameEn: text("紙名（英字）"),
      demoNote: longText("題字の下の断り（空なら出さない）"),
      showNav: { type: "boolean", title: "面ナビを出す" },
      navBase: text("面ナビの飛び先の前置き（例 /home/news）"),
      audio: AUDIO,
    }),
  },
  NewsFrontPage: {
    _componentDesc: desc("NewsFrontPage"),
    posts: SAMPLE_POSTS,
    audio: [],
    ...LINK_DEFAULTS,
    __schema: schema("NewsFrontPage", { posts: POSTS, audio: AUDIO, ...LINK_SCHEMA }),
  },
  NewsFlashBand: {
    _componentDesc: desc("NewsFlashBand"),
    posts: SAMPLE_POSTS,
    ...LINK_DEFAULTS,
    __schema: schema("NewsFlashBand", { posts: POSTS, ...LINK_SCHEMA }),
  },
  NewsBroadcastBand: {
    _componentDesc: desc("NewsBroadcastBand"),
    posts: SAMPLE_POSTS,
    audio: [],
    limit: BAND_LIMIT,
    moreHref: "/home/news/broadcast",
    __schema: schema("NewsBroadcastBand", {
      posts: POSTS,
      audio: AUDIO,
      limit: int("出す本数"),
      moreHref: text("「すべての放送」の行き先"),
    }),
  },
  NewsBroadcastList: {
    _componentDesc: desc("NewsBroadcastList"),
    posts: SAMPLE_POSTS,
    audio: [],
    emptyText: "バーチャル放送はまだありません。",
    __schema: schema("NewsBroadcastList", { posts: POSTS, audio: AUDIO, emptyText: text("放送が無いときの文") }),
  },
  NewsFaceToolbar: {
    _componentDesc: desc("NewsFaceToolbar"),
    faces: SAMPLE_FACES,
    facesStateKey: NEWS_STATE_KEYS.faces,
    keywordStateKey: NEWS_STATE_KEYS.keyword,
    orderStateKey: NEWS_STATE_KEYS.order,
    filterEvent: NEWS_EVENTS.filterChanged,
    searchEvent: NEWS_EVENTS.searchChanged,
    sortEvent: NEWS_EVENTS.sortChanged,
    // 部品はコードでも state に書く（古い保存ページでも検索が効くように）。規則は配線を
    // ⚡ Page Events に見せ、別の state へも流せるようにするためのもの。
    __interactions: NEWS_TOOLBAR_INTERACTIONS,
    __schema: schema("NewsFaceToolbar", {
      faces: FACES,
      facesStateKey: text("面を書く page state（カンマ区切り）"),
      keywordStateKey: text("検索語を書く page state"),
      orderStateKey: text("並びを書く page state"),
      filterEvent: { type: "string", title: "面の絞り込みイベント", description: "{ faces, face, active }" },
      searchEvent: { type: "string", title: "検索イベント", description: "{ keyword }" },
      sortEvent: { type: "string", title: "並びイベント", description: "{ order }" },
    }),
  },
  NewsArticleGrid: {
    _componentDesc: desc("NewsArticleGrid"),
    posts: SAMPLE_POSTS,
    audio: [],
    showWhen: "filtered",
    emptyText: "この条件に合う記事はありません。",
    ...BOARD_DEFAULTS,
    ...LINK_DEFAULTS,
    __schema: schema("NewsArticleGrid", {
      posts: POSTS,
      audio: AUDIO,
      ...BOARD_SCHEMA,
      ...LINK_SCHEMA,
      showWhen: { type: "string", title: "出すとき", enum: ["filtered", "always"] },
      emptyText: text("0 件のときの文"),
    }),
  },
  NewsFaceBoard: {
    _componentDesc: desc("NewsFaceBoard"),
    posts: SAMPLE_POSTS,
    faces: SAMPLE_FACES,
    audio: [],
    hideWhenFiltered: true,
    ...BOARD_DEFAULTS,
    ...LINK_DEFAULTS,
    __schema: schema("NewsFaceBoard", {
      posts: POSTS,
      faces: FACES,
      audio: AUDIO,
      ...BOARD_SCHEMA,
      ...LINK_SCHEMA,
      hideWhenFiltered: { type: "boolean", title: "絞り込み中は隠す" },
    }),
  },
  NewsListenBand: {
    _componentDesc: desc("NewsListenBand"),
    posts: SAMPLE_POSTS,
    audio: [],
    limit: BAND_LIMIT,
    moreHref: "/home/news/listen",
    ...LINK_DEFAULTS,
    __schema: schema("NewsListenBand", {
      ...LINK_SCHEMA,
      posts: POSTS,
      audio: AUDIO,
      limit: int("出す本数"),
      moreHref: text("「すべての読み上げ」の行き先"),
    }),
  },
  NewsPaperPreview: {
    _componentDesc: desc("NewsPaperPreview"),
    posts: SAMPLE_POSTS,
    editions: [],
    viewerHref: "/deepzoom/",
    __schema: schema("NewsPaperPreview", { posts: POSTS, editions: EDITIONS, viewerHref: text("高精細ビューアの行き先") }),
  },
  NewsSubscriptionBand: {
    _componentDesc: desc("NewsSubscriptionBand"),
    ...SUBSCRIPTION,
    __schema: schema("NewsSubscriptionBand", {
      heading: text("見出し"),
      body: longText("本文"),
      singleNote: longText("単発の案内"),
      primaryLabel: text("ボタン（定期購読）"),
      singleLabel: text("ボタン（単発）"),
      href: text("送り先"),
    }),
  },
  NewsAskPanel: {
    _componentDesc: desc("NewsAskPanel"),
    presenters: [],
    askGuest: IMPRINT.askGuest,
    ...LINK_DEFAULTS,
    __schema: schema("NewsAskPanel", { presenters: PRESENTERS, askGuest: longText("会員でない人への案内"), ...LINK_SCHEMA }),
  },
  NewsGuestPromo: {
    _componentDesc: desc("NewsGuestPromo"),
    posts: SAMPLE_POSTS,
    presenters: [],
    editions: [],
    audio: [],
    __schema: schema("NewsGuestPromo", { posts: POSTS, presenters: PRESENTERS, editions: EDITIONS, audio: AUDIO }),
  },
  NewsFooter: {
    _componentDesc: desc("NewsFooter"),
    faces: SAMPLE_FACES,
    publisher: IMPRINT.publisher,
    membershipNote: IMPRINT.membershipNote,
    platformNote: IMPRINT.platformNote,
    demoNote: IMPRINT.demoNote,
    __schema: schema("NewsFooter", {
      faces: FACES,
      publisher: text("発行所"),
      membershipNote: longText("会員の案内"),
      platformNote: longText("基盤の案内"),
      demoNote: longText("断り（空なら出さない）"),
    }),
  },
  NewsAudioBar: {
    _componentDesc: desc("NewsAudioBar"),
    audio: [],
    __schema: schema("NewsAudioBar", { audio: AUDIO }),
  },
};

