// 素材タブの元（Ghost の post_media）。読み・絞りはここ 1 本 — 画面（AssetsTab）は描くだけ。
//
// 読む口は **staff 用の `/ghost/api/admin/post-media/`**（Ghost `post-media-admin.js`）。
// 公開用の `/content/post-media/` は公開記事しか返さず、`post_id` も受けない（渡しても全件が
// 返る — 2026-10-13 実測）ので、下書きの素材も「この記事の素材」も出せない。

import type { MediaInfo } from "../core";
import { getJson } from "./api";
import { asRecord, asText, faceOf, paperDayOfPost, stateOf, type ArticleState, type DeskArticle } from "./model";

export const POST_MEDIA_URL = "/ghost/api/admin/post-media/";

/** 1 回に読む行数（Ghost 側の上限も 100）。 */
export const POST_MEDIA_PAGE_SIZE = 100;

/** 全件読みの上限（ページ数）。100 件 × 20 = 2000 件を超えたら、そこで止めて言う。 */
export const POST_MEDIA_MAX_PAGES = 20;

export type PostMediaType = "image" | "video" | "audio";

export type PostMediaRow = {
  id: string;
  postId: string;
  type: PostMediaType;
  url: string;
  thumbnailUrl: string | null;
  caption: string;
  /** `feature` = 記事の絵（feature_image）、`content` = 本文の中。 */
  role: "feature" | "content";
  /** 行に載っている記事の題（記事が机の一覧に無いときの表示用）。 */
  postTitle: string;
  /** 記事の中の並び。0 = 記事の絵（feature_image）か、本文の最初の素材。 */
  sortOrder: number;
};

const MEDIA_TYPES = new Set<PostMediaType>(["image", "video", "audio"]);

/**
 * 画面の `href` / `src` に載せてよい URL だけを通す（http(s) と、同じ origin の `/…`）。
 * `javascript:` などは素材として扱わない — post_media の URL は取り込みの入力から来る。
 */
export function safeMediaUrl(value: string): string | null {
  const url = value.trim();
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  return null;
}

/** Ghost の 1 行を写す。URL か種類が読めない行は素材として扱わない。 */
export function toPostMediaRow(raw: unknown): PostMediaRow | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asText(row.id).trim();
  const url = safeMediaUrl(asText(row.media_url)) ?? "";
  const type = asText(row.asset_type).trim() as PostMediaType;
  if (!id || !url || !MEDIA_TYPES.has(type)) return null;
  return {
    id,
    postId: asText(row.post_id).trim(),
    type,
    url,
    thumbnailUrl: safeMediaUrl(asText(row.thumbnail_url)),
    caption: asText(row.caption).trim() || asText(row.alt).trim(),
    role: asText(row.role).trim() === "feature" ? "feature" : "content",
    postTitle: asText(row.title),
    sortOrder: Number.isFinite(Number(row.sort_order)) ? Number(row.sort_order) : 0,
  };
}

/** 1 ページ分の応答を読む。`pages` が無ければ 1 ページで終わりとみなす。 */
export function readPostMediaPage(payload: unknown): { rows: PostMediaRow[]; pages: number } {
  const body = asRecord(payload);
  const list = Array.isArray(body?.post_media) ? (body?.post_media as unknown[]) : [];
  const rows = list.map(toPostMediaRow).filter((row): row is PostMediaRow => row !== null);
  const pagination = asRecord(asRecord(body?.meta)?.pagination);
  const pages = Number(pagination?.pages);
  return { rows, pages: Number.isFinite(pages) && pages > 0 ? pages : 1 };
}

export function postMediaPageUrl(page: number, postId: string | null): string {
  const params = new URLSearchParams({ limit: String(POST_MEDIA_PAGE_SIZE), page: String(page) });
  if (postId) params.set("post_id", postId);
  return `${POST_MEDIA_URL}?${params.toString()}`;
}

/**
 * 素材を全部読む（`postId` を渡せばその記事だけ）。上限（`POST_MEDIA_MAX_PAGES`）で止めたら
 * `truncated`。読みの失敗は投げる — 呼ぶ側が理由を出す（握りつぶさない）。
 *
 * 1 ページ目で総ページ数が分かるので、2 ページ目からは同時に頼む（順に待つと 1 ページ
 * ごとに 1 往復ずつ伸びる。4 ページで約 0.5 秒）。並びはページの順のまま。
 */
export async function readAllPostMedia(postId: string | null): Promise<{ rows: PostMediaRow[]; truncated: boolean }> {
  const first = readPostMediaPage(await getJson(postMediaPageUrl(1, postId)));
  const pages = first.pages;
  const last = Math.min(pages, POST_MEDIA_MAX_PAGES);
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, last - 1) }, (_, index) =>
      getJson(postMediaPageUrl(index + 2, postId)).then(readPostMediaPage),
    ),
  );
  const rows = [first, ...rest].flatMap((read) => read.rows);
  return { rows, truncated: pages > POST_MEDIA_MAX_PAGES };
}

/** post_media の 1 行を共通の `MediaInfo`（`lib/mediaUtils.ts`）に写す。 */
export function toMediaInfo(row: PostMediaRow): MediaInfo {
  return {
    type: row.type,
    url: row.url,
    ...(row.thumbnailUrl ? { thumbnailUrl: row.thumbnailUrl } : {}),
    ...(row.caption ? { caption: row.caption } : {}),
  };
}

/**
 * 記事ごとの**本文の最初の素材**（role "content" の行で `sort_order` の最小）。カードの種類を
 * 決める元 — `services/ghost/postTransform.ts` の `contentMediaInfo`（本文の lexical/html の
 * 最初の素材）を Ghost 側で索引にしたのが post_media なので、机は本文を読まずにこれで引く。
 * role "feature" の行は feature_image そのもの（記事の `feature_image` で持っている）なので数えない。
 * 同じ並びなら先に来た行（Ghost は post_id・sort_order の順で返す）。
 */
export function firstBodyMediaByPost(rows: PostMediaRow[]): Map<string, PostMediaRow> {
  const first = new Map<string, PostMediaRow>();
  for (const row of rows) {
    if (!row.postId || row.role !== "content") continue;
    const seen = first.get(row.postId);
    if (!seen || row.sortOrder < seen.sortOrder) first.set(row.postId, row);
  }
  return first;
}

export type MediaFilter = {
  /** 記事の紙面日（null = すべて）。 */
  day: string | null;
  state: ArticleState | "all";
  /** 面の label（"" = すべて）。 */
  face: string;
  /** 媒体タグの slug（"" = すべて。記事タブの媒体の絞りと同じ意味）。 */
  medium: string;
  type: PostMediaType | "all";
  /** 記事 id（"" = すべて）。選ぶと Ghost に post_id で問い合わせる。 */
  postId: string;
  /** 記事の題・キャプションに含まれる語。 */
  word: string;
};

export const EMPTY_MEDIA_FILTER: MediaFilter = { day: null, state: "all", face: "", medium: "", type: "all", postId: "", word: "" };

export const isMediaFilterActive = (f: MediaFilter): boolean =>
  f.day !== null ||
  f.state !== "all" ||
  f.face !== "" ||
  f.medium !== "" ||
  f.type !== "all" ||
  f.postId !== "" ||
  f.word.trim() !== "";

/**
 * 机に載っている記事（= ニュースの記事。`useDesk` が `isNewsArticle` で絞った物）の素材だけ。
 * post_media は編集局の全投稿の素材を返すので、ニュースでない投稿（物件・試しの投稿など）の素材は
 * ここで落とす（ユーザー決定 2026-10-15）。
 */
export function newsMediaRows(rows: PostMediaRow[], articlesById: Map<string, DeskArticle>): PostMediaRow[] {
  return rows.filter((row) => articlesById.has(row.postId));
}

/**
 * 素材を絞る。日・状態・面・媒体は**素材の付いた記事**で見る（素材そのものは日も面も持たない）。
 * 机の一覧に無い記事（読めていない・権限外）の素材は、記事で絞る条件が 1 つでも在れば落とす —
 * 分からないものを「合う」とは言わない。
 */
export function filterPostMedia(
  rows: PostMediaRow[],
  filter: MediaFilter,
  articlesById: Map<string, DeskArticle>,
  now: Date
): PostMediaRow[] {
  const word = filter.word.trim().toLowerCase();
  const byArticle = filter.day !== null || filter.state !== "all" || filter.face !== "" || filter.medium !== "";
  return rows.filter((row) => {
    if (filter.postId && row.postId !== filter.postId) return false;
    if (filter.type !== "all" && row.type !== filter.type) return false;
    const article = articlesById.get(row.postId) ?? null;
    if (byArticle) {
      if (!article) return false;
      if (filter.day !== null && paperDayOfPost(article) !== filter.day) return false;
      if (filter.state !== "all" && stateOf(article, now) !== filter.state) return false;
      if (filter.face !== "" && (faceOf(article)?.label ?? "") !== filter.face) return false;
      if (filter.medium !== "" && !article.tags.some((tag) => tag.slug === filter.medium)) return false;
    }
    if (word) {
      const title = (article?.title ?? row.postTitle).toLowerCase();
      if (!title.includes(word) && !row.caption.toLowerCase().includes(word)) return false;
    }
    return true;
  });
}
