import { createContext, useContext, type ComponentType, type ReactNode } from "react";
import type { NewsPresenter, PaperSettings } from "../core";

export type NewsTranslate = (key: string, options?: Record<string, unknown>) => string;

/** "unknown" = まだ分からない（出してから消すと跳ぶので、分かるまで出さない）。 */
export type NewsViewerKind = "unknown" | "guest" | "signed-in";
export type NewsMemberMode = "signup" | "signin";

/**
 * ホストが注入するもの。パッケージはホストの URL を書かず、ホストのモジュールも
 * import しない — 要るものはここから受け取る。どれも省略でき、無ければその機能は
 * 出さない（音声カードが無ければ下の帯で鳴らす、など）。
 */
export interface NewsHostAdapter {
  /** 紙名・版号の基準（実行時の NEWS_* 設定）。 */
  usePaperSettings?: () => PaperSettings;
  /** 見ている人がログインしているか（スタッフ or 会員）。 */
  useViewerKind?: () => NewsViewerKind;
  /** その場で開く会員登録・ログイン。 */
  MemberDialog?: ComponentType<{
    open: boolean;
    mode: NewsMemberMode;
    presenters: NewsPresenter[];
    onClose: () => void;
  }>;
  /** カードの中で鳴らす音声プレーヤー。 */
  AudioCard?: ComponentType<{
    src: string;
    title?: string;
    playOnHeaderClick?: boolean;
    onPlay?: () => void;
  }>;
  /** 著作権表記。 */
  Copyright?: ComponentType<Record<string, unknown>>;
  /** ホストの口。 */
  urls?: {
    /** 記事に聞く（POST { messages }）。無ければ「記事に聞く」は会話欄を出さない。 */
    ask?: string;
  };
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

const useUnknownViewer = (): NewsViewerKind => "unknown";

/** 見ている人の種類。ホストが教えなければ「分からない」（案内も会話欄も出さない）。 */
export function useViewerKind(): NewsViewerKind {
  const { adapter } = useNews();
  const useHostViewer = adapter.useViewerKind ?? useUnknownViewer;
  return useHostViewer();
}
