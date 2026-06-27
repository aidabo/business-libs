export type ContentType = 'news' | 'government' | 'publication' | 'comic' | 'entertainment';

export type WritingMode = 'horizontal-tb' | 'vertical-rl' | 'vertical-lr';

export interface PublishContent {
  id: string;
  title: string;
  contentType: ContentType;
  excerpt: string;
  content?: string;
  image?: string;
  category?: string;
  section?: string;
  author?: string;
  publishedAt: string;
  tags?: string[];
  featured?: boolean;
  url?: string;
  // News-specific
  source?: string;
  // Government-specific
  issuingAuthority?: string;
  documentType?: string;
  documentFileUrl?: string;
  // Publication-specific
  isbn?: string;
  publisher?: string;
  pageCount?: number;
  format?: 'ebook' | 'paperback' | 'hardcover' | 'audiobook';
  price?: string;
  // Comic-specific
  seriesName?: string;
  chapterNumber?: number;
  totalChapters?: number;
  readingDirection?: 'ltr' | 'rtl' | 'vertical';
  // Entertainment-specific
  startDate?: string;
  endDate?: string;
  location?: string;
  ticketUrl?: string;
  priceRange?: string;
}

export interface Section {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  contentType?: ContentType;
  description?: string;
  count?: number;
}

export interface Author {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
}

export interface Publication {
  id: string;
  title: string;
  coverImage?: string;
  author?: string;
  publisher?: string;
  isbn?: string;
  pageCount?: number;
  format?: 'ebook' | 'paperback' | 'hardcover' | 'audiobook';
  price?: string;
  publishedDate?: string;
  description?: string;
}

export interface ComicChapter {
  id: string;
  seriesId: string;
  seriesName: string;
  chapterNumber: number;
  title: string;
  pageCount: number;
  publishedAt: string;
  coverImage?: string;
  pages?: string[];
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  image?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  category?: string;
  price?: string;
  ticketUrl?: string;
  organizer?: string;
}

/** Manga/comic series item for SeriesList and SeriesHeader */
export interface SeriesItem {
  id: string;
  title: string;
  coverImage?: string;
  author?: string;
  artist?: string;
  genres?: string[];
  rating?: number;
  status?: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
  chapterCount?: number;
  description?: string;
  isBookmarked?: boolean;
  latestChapter?: string;
  updatedAt?: string;
  views?: number;
  likes?: number;
}

export interface Document {
  id: string;
  title: string;
  issuingAuthority: string;
  documentDate: string;
  documentType: string;
  category?: string;
  fileUrl?: string;
  fileSize?: string;
  description?: string;
  urgent?: boolean;
}

export interface PublishSettings {
  siteName: string;
  siteDescription?: string;
  logo?: string;
  sections: Section[];
}

// ── StackPage Runtime Integration ──────────────────────────────────

/** Lightweight StackPage runtime API type (no dependency on stackpage lib) */
export interface StackPageRuntimeApi {
  widgetId: string;
  emit: (eventName: string, payload?: any) => void;
  emitWithAck: (
    eventName: string,
    payload?: any,
    options?: { responseEvent?: string; timeoutMs?: number }
  ) => Promise<any>;
  subscribe: (
    eventName: string,
    handler: (payload: any, meta: { sourceWidgetId: string; eventName: string }) => void
  ) => () => void;
  unsubscribe: (unsubscribeFn?: (() => void) | null) => void;
  setState: (path: string, value: any) => void;
  getState: <T = any>(path: string, defaultValue?: T) => T | undefined;
  setPageState?: (path: string, value: any) => void;
  getPageState?: <T = any>(path: string, defaultValue?: T) => T | undefined;
}

/** Shared state keys for publish page-builder communication */
export const PUBLISH_STATE_KEYS = {
  selectedContentId: "publish.selectedContentId",
  searchQuery: "publish.searchQuery",
  activeSection: "publish.activeSection",
  contentTypeFilter: "publish.contentTypeFilter",
  viewMode: "publish.viewMode",
} as const;

/** Event names for publish page-builder communication */
export const PUBLISH_EVENTS = {
  contentSelected: "publish:content:selected",
  sectionChanged: "publish:section:changed",
  searchChanged: "publish:search:changed",
} as const;

/** Build a content selection payload for events */
export function buildContentSelectionEvent(
  item: { id: string; title?: string; contentType?: string },
  source = "grid"
) {
  return {
    id: item.id,
    title: item.title || "",
    contentType: item.contentType || "",
    source,
  };
}

/** Get page state with fallback from stackpage runtime */
export function getPageState<T>(
  stackpage: StackPageRuntimeApi | undefined | null,
  key: string,
  fallback: T
): T {
  return stackpage?.getPageState?.(key, fallback) ?? stackpage?.getState?.(key, fallback) ?? fallback;
}

/** Set page state on stackpage runtime */
export function setPageState(
  stackpage: StackPageRuntimeApi | undefined | null,
  key: string,
  value: any
) {
  stackpage?.setPageState?.(key, value);
  stackpage?.setState?.(key, value);
}
