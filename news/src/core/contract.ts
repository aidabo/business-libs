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

/** Page-state paths the reader components write and the data sources read. */
export const NEWS_STATE_KEYS = {
  faces: "news.faces",
  keyword: "news.keyword",
  order: "news.order",
} as const;

/** Page Builder catalog group. */
export const NEWS_BUSINESS_ID = "news";
export const NEWS_BUSINESS_LABEL = "News Studio";
