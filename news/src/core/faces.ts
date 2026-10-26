// 面（紙面の割り付け）は Ghost の内部タグで持つ。
//
// 内部タグの名は `#経済面` のように「#」＋面名＋「面」。Ghost は「#」で始まるタグを
// 内部タグにする（管理画面のタグ一覧でしか見えない）。読者面には「#」も「面」も
// 出さず、面名だけを見せる。面という語は編集局の言葉なので、購読者に向けた呼び方に
// 直してから出す。
//
// 面そのものは記事から発見する。このファイルに面を列挙しないのは、面を増やすのが
// 編集局の仕事だからで、Ghost の管理画面で内部タグを足せば、それだけで面が 1 つ増える。
// ここに持つのは「知っている面の並び順」だけ。紙面の並びは編集局が決めるもので、
// 名前順にはならない。ここに無い面も使える（既知の面の後ろに、名前順で並ぶ）。
//
// 中分類（スポーツ面の中の野球・サッカー…）は、その面の記事に付いている公開タグ。
// 内部タグとは別の層なので、購読者には中分類だけが見える。抽出は select.ts が持つ。

/** 内部タグの印。Ghost は「#」で始まるタグを内部タグにする。 */
export const FACE_TAG_PREFIX = "#";

/** 面名の後ろに付ける語。画面には出さない。 */
export const FACE_TAG_SUFFIX = "面";

export type Face = {
  /**
   * 内部タグの slug。作る側（tools/news-worker/lib/janabiz-faces.mjs）が明示して渡す
   * （`#政治面` → `face-politics`）。渡さないと Ghost が日本語を翻字して読めない語になる。
   * 並びの同一性と頁内アンカーに使う。読者には見せない。
   */
  slug: string;
  /** 読者に見せる面名。「#」も「面」も付けない。 */
  label: string;
  /** 表示順。小さいほど先。 */
  order: number;
};

/**
 * 知っている面の並び順。ここに無い面も使える（Ghost で足せば現れる）。
 * 並びを変えたいときはこの表を直す。面を増やすときは Ghost に足す。
 *
 * `print` は紙面での記号（1面・2面…）。**読者の画面には出さない。** 購読者に
 * 「1面」と言っても何のことか分からないので、読者には面名（政治・社会…）だけを見せ、
 * 記号は編集局の画面と紙面プレビューだけで使う。並びと記号は紙面の都合で決まるので
 * 同じ表に置く（片方だけ直すと、面を足したときに番号が飛ぶ）。
 */
export const FACE_ORDER: { label: string; order: number; print: string }[] = [
  { label: "政治", order: 0, print: "1面" },
  { label: "社会", order: 1, print: "2面" },
  { label: "総合", order: 2, print: "3面" },
  { label: "地域", order: 3, print: "4面" },
  { label: "経済", order: 4, print: "5面" },
  { label: "国際", order: 5, print: "6面" },
  { label: "スポーツ", order: 6, print: "7面" },
  { label: "文化", order: 7, print: "8面" },
  { label: "芸能", order: 8, print: "9面" },
];

/** 知らない面の順位。既知の面より必ず後ろになる。 */
export const UNKNOWN_FACE_ORDER = FACE_ORDER.length;

const ORDER_BY_LABEL = new Map(FACE_ORDER.map((entry) => [entry.label, entry.order]));
const PRINT_BY_LABEL = new Map(FACE_ORDER.map((entry) => [entry.label, entry.print]));

/** 面名の表示順。知らない面は UNKNOWN_FACE_ORDER。 */
export function faceOrderOf(label: string): number {
  return ORDER_BY_LABEL.get(label) ?? UNKNOWN_FACE_ORDER;
}

/**
 * 面名から紙面の記号（1面・2面…）を引く。**編集局の画面でしか使わない。**
 * 知らない面は空文字（記号が無いものとして扱う）。
 */
export function facePrintOf(label: string): string {
  return PRINT_BY_LABEL.get(label) ?? "";
}

/**
 * タグから面名を読む。面の内部タグでなければ null。
 *
 * Ghost は日本語の slug を翻字する（`#東京都` → `hash-dong-jing-du`）ので、slug では
 * なく name を見る。読者面の経路（POST /api/posts）は visibility を落とすため、
 * 「内部タグかどうか」は「#」で始まるかで判定する。
 */
export function faceLabelOfTag(tag: { name?: unknown } | null | undefined): string | null {
  const raw = String(tag?.name ?? "").trim();
  if (!raw.startsWith(FACE_TAG_PREFIX)) return null;
  const body = raw.slice(FACE_TAG_PREFIX.length).trim();
  if (!body.endsWith(FACE_TAG_SUFFIX)) return null;
  const label = body.slice(0, -FACE_TAG_SUFFIX.length).trim();
  return label.length > 0 ? label : null;
}
