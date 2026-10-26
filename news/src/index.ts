import type { ComponentType } from "react";

export { NewsProvider, useNews, useT } from "./adapter/NewsContext";
export type { NewsHostAdapter, NewsTranslate } from "./adapter/NewsContext";
export * from "./core";

/** News Studio components, keyed by their Page Builder name (all `News*`). */
export const NewsComponents: Record<string, ComponentType<any>> = {};

/** Default props (`_componentDesc`, `__schema`, sample data) per component. */
export const NewsDefaultProps: Record<string, Record<string, unknown>> = {};

/** One-click page recipes for the News Studio catalog group. */
export const NEWS_PAGE_RECIPES: readonly unknown[] = [];
