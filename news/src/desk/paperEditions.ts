/**
 * 電子紙面（机の EDITIONS）の絞り込み — **純関数だけ**。
 *
 * 紙面タブは Ghost admin endpoint（/ghost/api/admin/social/ai/dzi/jobs/）から全件を 1 回だけ読む（窓）。
 * 検索・媒体・面・日・並び順はこの窓の中で掛ける。打鍵ごとに route へ往復させないのは、
 * 机の操作が手元で即座に返る方を取るため（route の keyword 口は窓そのものを
 * 引き直す用途で、机の 1 文字ごとの絞りには向かない）。
 *
 * **既定は窓のすべて**（ユーザー指示 2026-10-10）。最初から日で隠すと、窓が大きい
 * ほど「紙面が無い」と読める。日 select は絞るための口として残す。
 *
 * 絞り込みの意味はここ 1 か所。描く側（PaperEditions.tsx）は状態だけを持つ。
 */

import { paperDayOf } from "../core";
import type { PaperEdition } from "../core";
import { dayLabel, faceLabelOfTag, type DeskTag } from "./model";

/** 並び順。既定は新しい順 — 取り込んだ順ではなく紙面の新しい順（遡って刷った紙面があるため）。 */
export type EditionOrder = "newest" | "oldest";

/** 公開状態の絞り込み。既定は「すべて」— 下書きも公開済みも一覧に出す（編集局の口）。 */
export type EditionStatusFilter = "all" | "published" | "draft";

export type EditionFilter = {
  /** 打鍵ごとに窓へ当てる語（空 = 絞らない）。 */
  keyword: string;
  /** 媒体タグの id（"" = 絞らない）。 */
  mediumId: string;
  /** 面タグの id（"" = 絞らない）。 */
  faceId: string;
  /** 紙面日（"" = すべて、YYYY-MM-DD = 指定）。 */
  day: string;
  /** 並び順。 */
  order: EditionOrder;
  /** 公開状態（"all" = 絞らない）。 */
  status: EditionStatusFilter;
};

/** 何も触っていない状態 = 窓のすべてを新しい順。 */
export const EMPTY_EDITION_FILTER: EditionFilter = {
  keyword: "",
  mediumId: "",
  faceId: "",
  day: "",
  order: "newest",
  status: "all",
};

/** どれか 1 つでも触ったか（「解除」を出す判断）。空白だけの打鍵と既定の並びは触った内に入れない。 */
export function editionFilterActive(filter: EditionFilter): boolean {
  return (
    filter.keyword.trim() !== "" ||
    filter.mediumId !== "" ||
    filter.faceId !== "" ||
    filter.day !== "" ||
    filter.order !== "newest" ||
    filter.status !== "all"
  );
}

/**
 * 紙面日（JST の YYYY-MM-DD、"" = 読めない）。
 *
 * 読むのは `datedAt` 1 本（published_at → date の順で畳んである）。畳んだ後の
 * 計算は `paperDayOf` 1 本に通す — 素の getDate は端末の時計任せで、JST の朝刊が
 * 前日になる（select.ts と同じ理由）。paperDayOf は読めない値で投げるので、
 * 先に空と不正を外す（model.ts の paperDayOfPost と同じ作法）。
 */
export function dayOfEdition(edition: PaperEdition): string {
  const value = edition.datedAt.trim();
  if (!value || Number.isNaN(new Date(value).getTime())) return "";
  return paperDayOf(value);
}

/** 窓に現れる紙面日と件数（新しい順）。日の読めない紙面は数えない — 升目に置けない。 */
export function editionDaysOf(editions: PaperEdition[]): { day: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const edition of editions) {
    const day = dayOfEdition(edition);
    if (!day) continue;
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => b.day.localeCompare(a.day));
}

/**
 * 紙面の媒体名（"" = 名乗れない）。
 *
 * **記事の `mediumLabelOfArticle` と違い、「媒体なし」を返さない。** 記事のタグは
 * 記事に付いている事実なので、無ければ「媒体なし」と言える。紙面の媒体は 2026-10 に
 * 足した欄で、それ以前の紙面は空のまま — 空を「なし」と書くと古い紙面が全部
 * 「媒体なし」の山になり、繋ぎ直す手も無いのに警告だけが残る。名乗れるものだけ名乗る。
 */
export function editionMediumName(edition: PaperEdition, mediums: DeskTag[]): string {
  if (!edition.mediumId) return "";
  return mediums.find((medium) => medium.id === edition.mediumId)?.name ?? "";
}

/** 紙面の面名（"" = 名乗れない）。面 id → タグ → label は faces.ts の 1 本に通す。 */
export function editionFaceLabel(edition: PaperEdition, tags: DeskTag[]): string {
  if (!edition.faceId) return "";
  const tag = tags.find((row) => row.id === edition.faceId);
  return tag ? faceLabelOfTag(tag) ?? "" : "";
}

/** 検索の的。**画面に出ている語で引ける** — 題・紙名・版・取り込み元・媒体名・面名・紙面日。 */
export function editionHaystack(edition: PaperEdition, mediums: DeskTag[], tags: DeskTag[]): string {
  const day = dayOfEdition(edition);
  return [
    edition.title,
    edition.publicationName,
    edition.edition,
    edition.sourceName,
    editionMediumName(edition, mediums),
    editionFaceLabel(edition, tags),
    day,
    day ? dayLabel(day) : "",
  ]
    .join(" ")
    .toLowerCase();
}

/**
 * 窓の中を絞り、**選んだ並びに並べ直す**。
 *
 * 並べ直すのは route の返す順に頼らないため — 遡って刷った紙面（昨日の紙を今日
 * 公開）は、取り込みの並びと紙面の並びが食い違う。**日を読めない紙面は、どちらの
 * 向きでも最後**（順路に置けない）。同時刻は id で決める（並びを揺らさない）。
 * 入力の配列は並べ替えない。
 */
export function filterEditions(
  editions: PaperEdition[],
  filter: EditionFilter,
  mediums: DeskTag[],
  tags: DeskTag[],
): PaperEdition[] {
  const keyword = filter.keyword.trim().toLowerCase();
  const kept = editions.filter((edition) => {
    if (filter.mediumId && edition.mediumId !== filter.mediumId) return false;
    if (filter.faceId && edition.faceId !== filter.faceId) return false;
    if (filter.day && dayOfEdition(edition) !== filter.day) return false;
    if (filter.status === "published" && edition.isPublic === false) return false;
    if (filter.status === "draft" && edition.isPublic !== false) return false;
    if (keyword && !editionHaystack(edition, mediums, tags).includes(keyword)) return false;
    return true;
  });
  // 読めない日は null（時 0 ではない — 「読めなかった」と「古い」を混ぜない）。
  const at = (edition: PaperEdition): number | null => {
    const time = new Date(edition.datedAt).getTime();
    return Number.isFinite(time) ? time : null;
  };
  const oldest = filter.order === "oldest";
  return kept.sort((a, b) => {
    const ta = at(a);
    const tb = at(b);
    if (ta === null && tb === null) return a.id.localeCompare(b.id);
    if (ta === null) return 1;
    if (tb === null) return -1;
    return (oldest ? ta - tb : tb - ta) || a.id.localeCompare(b.id);
  });
}
