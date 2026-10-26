import { NEWS_DATASOURCE_IDS, NEWS_STATE_KEYS } from "./contract";

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
});

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
export function createNewsReaderPage() {
  const layout = [
    widget("news-masthead", "NewsMasthead", 0, 8, { audio: S.audio }),
    widget("news-guest", "NewsGuestPromo", 8, 12, { posts: S.posts, presenters: S.presenters, editions: S.editions, audio: S.audio }),
    widget("news-front", "NewsFrontPage", 20, 18, { posts: S.posts, audio: S.audio }),
    widget("news-flash", "NewsFlashBand", 38, 6, { posts: S.posts }),
    widget("news-broadcast", "NewsBroadcastBand", 44, 10, { posts: S.posts, audio: S.audio }),
    widget("news-toolbar", "NewsFaceToolbar", 54, 5, { faces: S.faces }),
    widget("news-results", "NewsArticleGrid", 59, 12, { posts: S.postsFiltered }),
    widget("news-board", "NewsFaceBoard", 71, 24, { posts: S.posts, faces: S.faces }),
    widget("news-listen", "NewsListenBand", 95, 10, { posts: S.posts, audio: S.audio }),
    widget("news-paper", "NewsPaperPreview", 105, 12, { posts: S.posts, editions: S.editions }),
    widget("news-subscribe", "NewsSubscriptionBand", 117, 6),
    widget("news-ask", "NewsAskPanel", 123, 10, { presenters: S.presenters }),
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
