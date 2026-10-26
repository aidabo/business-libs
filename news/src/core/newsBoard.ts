// 読者面の「面の絞り込み・記事検索・並び替え」の実体（純関数）。
//
// 記事は /api/posts から 1 回取ってきた配列をそのまま持っている。絞り込みも
// 並び替えも、その配列に規則を当てるだけの仕事なので、ここに純関数として置く。
//
// かつてはページビルダーの共有部品（TagFilterBar / PostSearchBar / OrderBar）に
// 操作を任せ、その契約イベントを拾って同じ規則を当てていた。いまは読者面が
// 自前の操作子を持つので、間に立つ層は要らない（状態キーとイベント名も消した）。
//
// DOM も fetch も知らない。vitest の既定は environment: "node" なので、ここに
// 描画（React 要素）を混ぜると DOM 無しで試せなくなる（select.ts と同じ理由）。

import type { NewsPost as Post } from "./post";
import { faceLabelOfTag } from "./faces";

/** 並びが決まらないときの落とし所。 */
export const DEFAULT_ORDER = "published_at desc";

/**
 * 並び替えに使える項目。
 *
 * 日付 3 つは Ghost の列、件数 4 つは count の欄。`related_date` は
 * Ghost 側で NULL がありうるので、値が無い記事は 0（＝最古）として扱う。
 */
const DATE_FIELDS = new Set(["published_at", "updated_at", "related_date"]);
const COUNT_FIELDS = new Set(["favors", "comments", "bookmarks", "forwards"]);

export type BoardOrder = {
  /** published_at / updated_at / related_date / favors / comments / bookmarks / forwards */
  field: string;
  /**
   * 降順か。`asc` と書かれているときだけ false になる。並びの既定が desc なので、
   * 向きの指定が無い値は desc に寄せる。
   */
  desc: boolean;
};

/**
 * 「項目 向き」の 1 行（例 "favors desc"）を読む。
 *
 * 知らない項目名は published_at に落とす。選択肢は NewsToolbar の ORDER_CHOICES に
 * 揃えてあるので、ここに来るのは外から壊れた値が入ったときだけ。黙って新しい順に
 * 戻すより、並びが違うことに気づける既定へ寄せる。
 */
export function parseOrder(order: unknown): BoardOrder {
  const [field = "", dir = ""] = String(order ?? "")
    .trim()
    .split(/\s+/);
  const known = DATE_FIELDS.has(field) || COUNT_FIELDS.has(field);
  return {
    field: known ? field : "published_at",
    desc: dir.toLowerCase() !== "asc",
  };
}

/** 記事 1 本の並び替え用の値。大きいほど降順で先頭に来る。 */
function orderValue(post: Post, field: string): number {
  if (COUNT_FIELDS.has(field)) {
    const counts = post.count as Record<string, number> | undefined;
    const value = Number(counts?.[field]);
    return Number.isFinite(value) ? value : 0;
  }
  const raw = (post as unknown as Record<string, unknown>)[field];
  const at = new Date(String(raw ?? "")).getTime();
  return Number.isFinite(at) ? at : 0;
}

/**
 * 並び替える。元の配列は触らない。
 *
 * 同値のときは published_at の降順で割る。件数系は `/api/posts` が count を
 * 返さないと全部 0 になり、そのときは結局この第 2 キーだけが効くので、
 * 結果は既定の `published_at desc` と一致する。
 */
export function sortPosts(posts: Post[], order: unknown): Post[] {
  const { field, desc } = parseOrder(order);
  return [...posts].sort((a, b) => {
    const av = orderValue(a, field);
    const bv = orderValue(b, field);
    if (av !== bv) return desc ? bv - av : av - bv;
    return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
  });
}

/**
 * 検索の当て先。見出し・前文・公開タグ（slug と表示名）を 1 本の文字列にする。
 *
 * 内部タグは入れない。面の内部タグ（`#経済面`）は編集局の言葉で、読者が打つ語では
 * ないため（入れると「面」の 1 字でどの記事にも当たってしまう）。
 */
export function searchText(post: Post): string {
  const tags = (post.tags ?? [])
    .filter((tag) => faceLabelOfTag(tag) === null)
    .map((tag) => `${tag.slug ?? ""} ${tag.name ?? ""}`);
  return [post.title, post.excerpt ?? "", ...tags].join(" ").toLowerCase();
}

/**
 * 記事検索。空の語なら絞らない。
 *
 * Ghost 側の FULLTEXT と違い、部分一致で見出し以外も見る。この面は
 * 100 本までしか取らないので、索引の当たりを再現するより読者が期待する
 * 「打った語がどこかに出る記事」を返す方がよい。
 */
export function filterByKeyword(posts: Post[], keyword: unknown): Post[] {
  const needle = String(keyword ?? "").trim().toLowerCase();
  if (!needle) return posts;
  return posts.filter((post) => searchText(post).includes(needle));
}

/**
 * 面の絞り込みが効いているか。空文字と空白だけの並びは「未選択」と見なす。
 *
 * 文字列（"economy,sports"）と配列（["economy","sports"]）の両方を受ける。
 * 読者面は配列で持っているが、試験では 1 行で書けた方が読みやすい。
 */
export function activeTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }
  return String(value ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

/**
 * 面の絞り込み。選ばれた面名のいずれかを持つ記事だけ残す。空なら絞らない。
 *
 * 面名で引くのは、面の内部タグ（`#経済面`）の slug を Ghost が翻字して振るため
 * （`#経済面` → `hash-jing-ji-mian`）。面名は内部タグの name から読めるので、
 * slug を知らなくても絞り込める。
 *
 * 面タグを 2 つ持つ記事は、どちらかが選ばれていれば出す。面立てのように
 * 「先に出た面にだけ置く」規則はここでは要らない（読者が選んだ面で見たい）。
 */
export function filterByFaces(posts: Post[], faces: unknown): Post[] {
  const wanted = new Set(activeTags(faces));
  if (wanted.size === 0) return posts;
  return posts.filter((post) =>
    (post.tags ?? []).some((tag) => {
      const label = faceLabelOfTag(tag);
      return label !== null && wanted.has(label);
    }),
  );
}

/** 絞り込みが 1 つでも効いていれば true。面立てを結果一覧に切り替える判断。 */
export function isBoardFiltered(faces: unknown, keyword: unknown): boolean {
  return activeTags(faces).length > 0 || String(keyword ?? "").trim().length > 0;
}
