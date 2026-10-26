// 机の読み書き。**新しい API は作らない** — 既にある口をブラウザセッションで叩くだけ（spec §6）。
//
// セッション Cookie は /ghost に張られているので /ghost/api/admin/* を通す。相対 URL で呼べば
// Next の rewrites が Ghost まで運び、middleware が Origin を GHOST_FRONT_URL へ直す
// （apps/host/src/middleware.ts:288-295）。
//
// services/ghost/postWriteCapabilities.ts は使えない — あれはサーバー専用で
// process.env.GHOST_ADMIN_API_URL を読む（机はブラウザで動く）。

import { errorText, withUpdatedAt, type DeskArticle } from "./model";

/** Ghost Admin API（ブラウザのスタッフセッションで届く所）。 */
export const ADMIN = "/ghost/api/admin";

/**
 * 記事。**全状態**（公開・予約・下書き）を 1 回で読む。`include=tags` と `plaintext` が要る。
 * `visibility` は有料・無料の数を数えるのに使う（記事タブと机の数字）。
 * `authors` は記事・素材のカードに書き手を出すため（`fields=` に関係なく載る）。
 */
export const POSTS_URL =
  `${ADMIN}/posts/?limit=all&include=tags,authors` +
  "&fields=id,slug,title,status,featured,feature_image,published_at,updated_at,created_at,plaintext,visibility";

/**
 * タグ全部。**媒体と紙面を 1 回で読む**（admin の口。admin 応答の鍵は `tags`）。
 *
 * 一覧を 1 本にしたのは、机が**媒体も紙面も書く**ようになったため。書き込みを挟む口は
 * 60 秒キャッシュを持てない（作る/改名した直後に**書き前の姿**が出る。0 件なら
 * 「まだありません。」が最大 60 秒残る）。host の口（`/api/tags?classification=…`）は読むだけの
 * 頃の名残で、いまは使わない。分類（媒体 / 紙面 / その他）は `tagMarkOf` が 1 本で見分ける。
 */
export const TAGS_LIST_URL = `${ADMIN}/tags/?limit=all&order=name asc`;

/** 読み上げのジョブ。机と工人が同じ行を見る。 */
export const NEWS_JOBS_URL = `${ADMIN}/internal/social/ai/news/jobs/`;

/** 読み上げを積む先のプロジェクト。`news-read` は project_id が要る。 */
export const PROJECTS_URL = `${ADMIN}/internal/social/ai/projects/?limit=50`;

/** タグの作成・改名・分類の付け替え（媒体と紙面のタブだけが使う）。 */
export const TAGS_URL = `${ADMIN}/tags/`;

/** 記事 1 本の読み書き。**記事の書きはここ 1 本だけ**（spec §6）。 */
export const postUrl = (id: string): string => `${ADMIN}/posts/${encodeURIComponent(id)}/?include=tags`;

/**
 * 記事 1 本の書きの組み立て。**`updated_at` はここで必ず載る**（消すと実機だけ 422）。
 *
 * 純関数にしてあるのは、送る体を試験で留めるため — `useDesk.write` の 1 行を
 * `{ posts: [patch] }` に戻しても、フックを走らせない試験では赤くならず、実機だけが 422 に戻る
 * （この形の事故はこのブランチで 2 回起きた・実測 2026-10-02）。
 */
export function postWriteRequest(article: DeskArticle, patch: Record<string, unknown>) {
  return { url: postUrl(article.id), body: { posts: [withUpdatedAt(article, patch)] } };
}

async function readBody(res: Response): Promise<unknown> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** 読みは GET だけ。**失敗を握りつぶさない**（机は赤帯に理由を出す・V6）。 */
export async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, { credentials: "same-origin", cache: "no-store" });
  const body = await readBody(res);
  if (!res.ok) throw new Error(errorText(body, `Ghost が ${res.status} を返しました`));
  return body;
}

/** 書き。PUT は記事 1 本とタグの改名/分類、POST はタグの作成。 */
export async function sendJson(
  url: string,
  method: "POST" | "PUT",
  body: unknown
): Promise<unknown> {
  const res = await fetch(url, {
    method,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await readBody(res);
  if (!res.ok) throw new Error(errorText(payload, `Ghost が ${res.status} を返しました`));
  return payload;
}
