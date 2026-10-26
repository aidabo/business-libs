import { createContext, useContext, type ReactNode } from "react";

export type NewsTranslate = (key: string, options?: Record<string, unknown>) => string;

/**
 * What the host injects. The package never hard-codes a host URL or imports a
 * host module; each later phase adds the members its components need.
 */
export interface NewsHostAdapter {
  /** fetch() bound to the host origin, with the host's auth conventions. */
  fetchJson?: <T = unknown>(url: string, init?: RequestInit) => Promise<T>;
}

interface NewsContextValue {
  t: NewsTranslate;
  adapter: NewsHostAdapter;
}

const identity: NewsTranslate = (key) => key;
const NewsContext = createContext<NewsContextValue>({ t: identity, adapter: {} });

export function NewsProvider({
  t = identity,
  adapter = {},
  children,
}: {
  t?: NewsTranslate;
  adapter?: NewsHostAdapter;
  children?: ReactNode;
}) {
  return <NewsContext.Provider value={{ t, adapter }}>{children}</NewsContext.Provider>;
}

export const useNews = () => useContext(NewsContext);
export const useT = () => useContext(NewsContext).t;
