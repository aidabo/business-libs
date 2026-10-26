import type { ComponentType } from "react";
import {
  NewsArticleGrid,
  NewsAskPanel,
  NewsAudioBar,
  NewsBroadcastBand,
  NewsBroadcastList,
  NewsFaceBoard,
  NewsFaceToolbar,
  NewsFlashBand,
  NewsFooter,
  NewsFrontPage,
  NewsGuestPromo,
  NewsListenBand,
  NewsMasthead,
  NewsPaperPreview,
  NewsSubscriptionBand,
} from "./reader/components";

export { NewsProvider, useNews, useT, useViewerKind } from "./adapter/NewsContext";
export type { NewsHostAdapter, NewsMemberMode, NewsTranslate, NewsViewerKind } from "./adapter/NewsContext";
export { registerAudioEntries, resetNewsAudio } from "./shared/NewsAudioContext";
export { NewsDefaultProps, SAMPLE_FACES, SAMPLE_POSTS } from "./reader/defaults";
export * from "./core";

/** News Studio components, keyed by their Page Builder name (all `News*`). */
export const NewsComponents: Record<string, ComponentType<any>> = {
  NewsMasthead,
  NewsGuestPromo,
  NewsFrontPage,
  NewsFlashBand,
  NewsBroadcastBand,
  NewsBroadcastList,
  NewsFaceToolbar,
  NewsArticleGrid,
  NewsFaceBoard,
  NewsListenBand,
  NewsPaperPreview,
  NewsSubscriptionBand,
  NewsAskPanel,
  NewsFooter,
  NewsAudioBar,
};
