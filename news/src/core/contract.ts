// Names shared by the host data sources and the package components. A saved
// page stores these strings, so they are permanent: rename only with an alias.

/** Host data source ids (`host-news-*`, see host-datasource-naming-rule.md). */
export const NEWS_DATASOURCE_IDS = {
  paperSettings: "host-news-paper-settings-public",
  faces: "host-news-faces-public",
  posts: "host-news-posts-public",
  audio: "host-news-audio-public",
  presenters: "host-news-presenters-public",
  editions: "host-news-editions-public",
} as const;

export type NewsDataSourceId =
  (typeof NEWS_DATASOURCE_IDS)[keyof typeof NEWS_DATASOURCE_IDS];

/**
 * Page-state paths (naming contract: the value, not the widget). The toolbar
 * writes faces / keyword / order; the filtered posts source reads them as
 * {{state.news.*}}. Article links write the selected post id.
 */
export const NEWS_STATE_KEYS = {
  faces: "news.filter.faces",
  keyword: "news.search.keyword",
  order: "news.sort.order",
  selectedPostId: "news.selectedPostId",
} as const;

/** Cross-widget contract events (`domain:entity:action`, payloads carry postId). */
export const NEWS_EVENTS = {
  /** { keyword } */
  searchChanged: "news:search:changed",
  /** { faces, face, active } — faces = 全選択（カンマ区切り）、face = 今押した面 */
  filterChanged: "news:filter:changed",
  /** { order } */
  sortChanged: "news:sort:changed",
  /** { postId, id, title, url } */
  postSelected: "news:post:selected",
  /** 編集局のタブを替えた: { tab } */
  deskTabChanged: "news:desk:tab:changed",
  /** 編集局のタブを替えてほしい（メニューなどから）: { tab } */
  deskTabSelect: "news:desk:tab:select",
} as const;

/** Page Builder catalog group. */
export const NEWS_BUSINESS_ID = "news";
export const NEWS_BUSINESS_LABEL = "News Studio";

/**
 * フィルタメニュー（NewsFaceToolbar）の既定の規則。部品はコードでも state に書くが、
 * 規則があると配線が Page Builder の ⚡ Page Events に出て、別の state へも流せる。
 */
export const NEWS_TOOLBAR_INTERACTIONS = [
  { id: "news-toolbar-filter-state", event: NEWS_EVENTS.filterChanged, action: "set-shared-state", targetPath: NEWS_STATE_KEYS.faces, valueFrom: "$.faces", enabled: true },
  { id: "news-toolbar-search-state", event: NEWS_EVENTS.searchChanged, action: "set-shared-state", targetPath: NEWS_STATE_KEYS.keyword, valueFrom: "$.keyword", enabled: true },
  { id: "news-toolbar-sort-state", event: NEWS_EVENTS.sortChanged, action: "set-shared-state", targetPath: NEWS_STATE_KEYS.order, valueFrom: "$.order", enabled: true },
];
