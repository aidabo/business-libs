import { createContext, useContext, type MouseEvent } from "react";
import { NEWS_EVENTS, NEWS_STATE_KEYS } from "../core";
import { setPageState, type StackPageRuntimeApi } from "../reader/stackpage";

// 記事へのリンクを 1 か所で決める（第一面・速報・記事カード・読み上げ・AI の出典が共用）。
//
// ── 押したときに起きること（common の PostGridCard と同じ順） ─────────────────
// 1. 選んだ記事を page state（既定 news.selectedPostId）に書く
// 2. 選択イベント（既定 news:post:selected、{ postId, id, title, url }）を出す
// 3. 行き先へ移る — "article" = /article/{id}/、"page" = Page Builder のページ
//    （/pages-public/view/{pageId}?postId={id}。そのページの PostView が記事を読む）、
//    "selection" = 移らない（同じページの PostView などがイベント／state で受ける）
//
// 編集中（isEditing）は移らない（イベントと state だけ — 編集画面で配線を試せる）。

export type NewsArticleDestination = "article" | "page" | "selection";

export type NewsLinkOptions = {
  destination: NewsArticleDestination;
  pageId: string;
  pageQueryKey: string;
  selectEvent: string;
  selectedPostStateKey: string;
  stackpage?: StackPageRuntimeApi;
  isEditing?: boolean;
};

export const DEFAULT_NEWS_LINK: NewsLinkOptions = {
  destination: "article",
  pageId: "",
  pageQueryKey: "postId",
  selectEvent: NEWS_EVENTS.postSelected,
  selectedPostStateKey: NEWS_STATE_KEYS.selectedPostId,
};

const SAFE_QUERY_KEY = /^[a-zA-Z][a-zA-Z0-9_.-]*$/;

/** 記事の行き先 URL（"selection" は空）。 */
export function articleHref(postId: string, options: Pick<NewsLinkOptions, "destination" | "pageId" | "pageQueryKey">): string {
  const id = String(postId ?? "").trim();
  if (!id || options.destination === "selection") return "";
  const encoded = encodeURIComponent(id);
  if (options.destination === "page") {
    const pageId = String(options.pageId ?? "").trim();
    if (!pageId) return `/article/${encoded}/`;
    const key = SAFE_QUERY_KEY.test(options.pageQueryKey) ? options.pageQueryKey : "postId";
    return `/pages-public/view/${encodeURIComponent(pageId)}?${encodeURIComponent(key)}=${encoded}`;
  }
  return `/article/${encoded}/`;
}

const NewsLinkCtx = createContext<NewsLinkOptions>(DEFAULT_NEWS_LINK);
export const NewsLinkProvider = NewsLinkCtx.Provider;

export type NewsArticleLink = { href: string | undefined; onClick: (event: MouseEvent) => void };

/** 記事 → { href, onClick }。ループの中でも呼べるよう、関数を返す。 */
export function useArticleLinker(): (post: { id: string; title?: string | null }) => NewsArticleLink {
  const options = useContext(NewsLinkCtx);
  return (post) => {
    const href = articleHref(post.id, options);
    return {
      href: href || undefined,
      onClick: (event) => {
        const postId = String(post.id ?? "").trim();
        if (postId) {
          if (options.selectedPostStateKey) setPageState(options.stackpage, options.selectedPostStateKey, postId);
          options.stackpage?.emit?.(options.selectEvent || NEWS_EVENTS.postSelected, {
            postId,
            id: postId,
            title: String(post.title ?? ""),
            url: href,
          });
        }
        if (options.isEditing || !href) event.preventDefault();
      },
    };
  };
}
