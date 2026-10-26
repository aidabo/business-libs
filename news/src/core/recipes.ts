import { NEWS_DATASOURCE_IDS, NEWS_EVENTS, NEWS_STATE_KEYS, NEWS_TOOLBAR_INTERACTIONS } from "./contract";

// News Studio のページの型（レシピ）。`createNewsReaderPage()` は /home/news と同じ並びの
// ページ（layout・source・pageState）を組んで返す — ホストの seed や AI ページビルダーが
// そのまま保存できる形（StackPage の widget = { id, x, y, w, h, content: JSON{name, props} }）。

export type NewsPageRecipe = {
  id: string;
  label: string;
  description: string;
  vertical: "news";
  requiredComponents: string[];
  optionalComponents: string[];
};

export const NEWS_PAGE_RECIPES: NewsPageRecipe[] = [
  {
    id: "news-reader",
    label: "ニュース第一面（読者）",
    description: "題字・第一面・速報・放送・面の絞り込みと検索・面立て・読み上げ・電子紙面・購読・AI・奥付（/home/news 相当）。",
    vertical: "news",
    requiredComponents: [
      "NewsMasthead",
      "NewsFrontPage",
      "NewsFlashBand",
      "NewsFaceToolbar",
      "NewsArticleGrid",
      "NewsFaceBoard",
      "NewsFooter",
    ],
    optionalComponents: [
      "NewsGuestPromo",
      "NewsBroadcastBand",
      "NewsListenBand",
      "NewsPaperPreview",
      "NewsSubscriptionBand",
      "NewsAskPanel",
      "NewsAudioBar",
    ],
  },
  {
    id: "news-article",
    label: "ニュースの記事",
    description: "題字・記事本文（common の PostView が ?postId= を読む）・奥付。読者面の記事リンクの行き先（/article 相当）。",
    vertical: "news",
    requiredComponents: ["NewsMasthead", "PostView", "NewsFooter"],
    optionalComponents: [],
  },
  {
    id: "news-desk",
    label: "編集局（デスク）",
    description: "電子紙面・記事・素材・読み上げ・放送・媒体と紙面のタブと今日の紙面の数字（/dashboard/news 相当、スタッフのみ）。",
    vertical: "news",
    requiredComponents: ["NewsDesk"],
    optionalComponents: [
      "NewsDeskSummary",
      "NewsDeskPaper",
      "NewsDeskArticles",
      "NewsDeskAssets",
      "NewsDeskReadAloud",
      "NewsDeskBroadcast",
      "NewsDeskMediums",
    ],
  },
  {
    id: "news-broadcast",
    label: "バーチャル放送の一覧",
    description: "題字と放送の一覧（/home/news/broadcast 相当）。",
    vertical: "news",
    requiredComponents: ["NewsMasthead", "NewsBroadcastList", "NewsFooter"],
    optionalComponents: [],
  },
];

/** ページのデータソース（page source の id）。posts は「全件」と「絞り込み」の 2 つ。 */
export const NEWS_PAGE_SOURCE_IDS = {
  posts: "news-posts",
  postsFiltered: "news-posts-filtered",
  faces: "news-faces",
  audio: "news-audio",
  presenters: "news-presenters",
  editions: "news-editions",
} as const;

const hostSource = (id: string, hostFunctionId: string, name: string, parameters: Record<string, unknown> = {}) => ({
  id,
  name,
  type: "host-function",
  hostFunctionId,
  wrapperKey: "items",
  parameters,
});

export const createNewsPageSource = () => ({
  lists: [],
  dataSources: [
    hostSource(NEWS_PAGE_SOURCE_IDS.posts, NEWS_DATASOURCE_IDS.posts, "ニュース記事 — 全件", { limit: 500 }),
    hostSource(NEWS_PAGE_SOURCE_IDS.postsFiltered, NEWS_DATASOURCE_IDS.posts, "ニュース記事 — 絞り込み", {
      faces: `{{state.${NEWS_STATE_KEYS.faces}}}`,
      keyword: `{{state.${NEWS_STATE_KEYS.keyword}}}`,
      order: `{{state.${NEWS_STATE_KEYS.order}}}`,
      limit: 500,
    }),
    hostSource(NEWS_PAGE_SOURCE_IDS.faces, NEWS_DATASOURCE_IDS.faces, "ニュースの面"),
    hostSource(NEWS_PAGE_SOURCE_IDS.audio, NEWS_DATASOURCE_IDS.audio, "読み上げ・放送"),
    hostSource(NEWS_PAGE_SOURCE_IDS.presenters, NEWS_DATASOURCE_IDS.presenters, "放送の話者"),
    hostSource(NEWS_PAGE_SOURCE_IDS.editions, NEWS_DATASOURCE_IDS.editions, "電子紙面", { limit: 8 }),
  ],
});

export const createNewsPageState = () => ({
  [NEWS_STATE_KEYS.faces]: "",
  [NEWS_STATE_KEYS.keyword]: "",
  [NEWS_STATE_KEYS.order]: "",
  [NEWS_STATE_KEYS.selectedPostId]: "",
});

export type NewsReaderPageOptions = {
  /** 記事を開く Page Builder のページ（createNewsArticlePage で作ったもの）。空なら /article/{id}/。 */
  articlePageId?: string;
};

/** 記事リンクの props（記事ページがあればそこへ、無ければ /article）。 */
const linkProps = (options: NewsReaderPageOptions) =>
  options.articlePageId
    ? { cardClickDestination: "page", cardClickPageId: options.articlePageId, cardClickPageQueryKey: "postId" }
    : { cardClickDestination: "article" };

const bind = (sourceId: string) => ({ sourceId, path: "$.items", targetType: "array", selector: { type: "all" } });

type Bindings = Partial<Record<"posts" | "faces" | "audio" | "presenters" | "editions", string>>;

const widget = (
  id: string,
  name: string,
  y: number,
  h: number,
  bindings: Bindings = {},
  props: Record<string, unknown> = {},
) => ({
  id,
  x: 0,
  y,
  w: 12,
  h,
  sizeToContent: true,
  content: JSON.stringify({
    name,
    props: {
      ...props,
      __bindings: Object.fromEntries(Object.entries(bindings).map(([prop, sourceId]) => [prop, bind(sourceId!)])),
    },
  }),
});

const S = NEWS_PAGE_SOURCE_IDS;

/** /home/news と同じ並びの読者面。 */
export function createNewsReaderPage(options: NewsReaderPageOptions = {}) {
  const link = linkProps(options);
  const layout = [
    widget("news-masthead", "NewsMasthead", 0, 8, { audio: S.audio }),
    widget("news-guest", "NewsGuestPromo", 8, 12, { posts: S.posts, presenters: S.presenters, editions: S.editions, audio: S.audio }),
    widget("news-front", "NewsFrontPage", 20, 18, { posts: S.posts, audio: S.audio }, link),
    widget("news-flash", "NewsFlashBand", 38, 6, { posts: S.posts }, link),
    widget("news-broadcast", "NewsBroadcastBand", 44, 10, { posts: S.posts, audio: S.audio }),
    widget("news-toolbar", "NewsFaceToolbar", 54, 5, { faces: S.faces }, { __interactions: NEWS_TOOLBAR_INTERACTIONS }),
    widget("news-results", "NewsArticleGrid", 59, 12, { posts: S.postsFiltered }, link),
    widget("news-board", "NewsFaceBoard", 71, 24, { posts: S.posts, faces: S.faces }, link),
    widget("news-listen", "NewsListenBand", 95, 10, { posts: S.posts, audio: S.audio }, link),
    widget("news-paper", "NewsPaperPreview", 105, 12, { posts: S.posts, editions: S.editions }),
    widget("news-subscribe", "NewsSubscriptionBand", 117, 6),
    widget("news-ask", "NewsAskPanel", 123, 10, { presenters: S.presenters }, link),
    widget("news-footer", "NewsFooter", 133, 8, { faces: S.faces }),
    widget("news-audiobar", "NewsAudioBar", 141, 1, { audio: S.audio }),
  ];
  return { layout: { children: layout }, source: createNewsPageSource(), pageState: createNewsPageState() };
}

/** /home/news/broadcast と同じ放送の一覧。 */
export function createNewsBroadcastPage() {
  const layout = [
    widget("news-masthead", "NewsMasthead", 0, 8, { audio: S.audio }, { navBase: "/home/news" }),
    widget("news-broadcast-list", "NewsBroadcastList", 8, 30, { posts: S.posts, audio: S.audio }),
    widget("news-footer", "NewsFooter", 38, 8, { faces: S.faces }),
  ];
  return { layout: { children: layout }, source: createNewsPageSource(), pageState: createNewsPageState() };
}

/**
 * 記事を読むページ（/article 相当）。本文は common の PostView — URL の ?postId= を読み、
 * 同じページでは news:post:selected / news.selectedPostId でも切り替わる。
 */
export function createNewsArticlePage() {
  const layout = [
    widget("news-masthead", "NewsMasthead", 0, 8, { audio: S.audio }, { showNav: false }),
    widget("news-article-body", "PostView", 8, 40, {}, {
      postId: "",
      postIdStateKey: NEWS_STATE_KEYS.selectedPostId,
      selectEvent: NEWS_EVENTS.postSelected,
    }),
    widget("news-footer", "NewsFooter", 48, 8, { faces: S.faces }),
  ];
  return { layout: { children: layout }, source: createNewsPageSource(), pageState: createNewsPageState() };
}

/**
 * 編集局（/dashboard/news 相当）。机 1 つ（NewsDesk）— タブ・数字・書き込みは机が持つ。
 * readerHref は読者面のページ（「読者面を見る」の行き先）。
 */
export function createNewsDeskPage(options: { readerHref?: string } = {}) {
  const layout = [
    widget("news-desk", "NewsDesk", 0, 60, {}, {
      readerHref: options.readerHref || "/home/news",
      initialTab: "paper",
      syncUrl: true,
    }),
  ];
  return { layout: { children: layout }, source: { lists: [], dataSources: [] }, pageState: {} };
}
