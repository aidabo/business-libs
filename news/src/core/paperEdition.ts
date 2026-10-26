import { coerceDziPages, dziThumbnailUrl } from "./dziPages";

/** 電子紙面 1 件（`host-news-editions-public` の 1 行、机の紙面棚の 1 枚）。 */
export type PaperEdition = {
  id: string;
  /** 紙面の呼び名。無ければ空文字。 */
  title: string;
  /** 1 ページ目の絵。無ければ空文字（そのときは枠だけ出す）。 */
  previewUrl: string;
  /** 高精細ビューア（/deepzoom）の URL。 */
  viewerUrl: string;
  /** 総ページ数。0 は不明。 */
  pageCount: number;
  /** 紙面日の元の時刻（published_at → 応答の date）。空 = 読めない。畳んでから使う。 */
  datedAt: string;
  /** 公開日（publish が刻んだ生の値）。空 = 未設定。 */
  publishedAt: string;
  /** 紙名・版・取り込み元（検索の的）。 */
  publicationName: string;
  edition: string;
  sourceName: string;
  /** 媒体・面の Ghost タグ id（空 = 2026-10 以前の紙面）。 */
  mediumId: string;
  faceId: string;
  /** 取り込み時刻（created_at）。空 = 不明。 */
  createdAt?: string;
  /** 公開状態（undefined = 古い応答 → 公開扱い）。 */
  isPublic?: boolean;
};

export type DziEditions = {
  items: PaperEdition[];
  /** まだ見に行っていない。 */
  loading: boolean;
  /** 1 件以上あるか。導線を出すかどうかの判断（spec §4 の⑤・§10-8）。 */
  available: boolean;
};

const text = (value: unknown) => String(value ?? "").trim();

const positive = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
};

/**
 * 応答の 1 件を読む。id が取れない行は落とす（開けないため）。
 *
 * 絵は「保存済みの preview_url」を先に見て、無ければ DZI のタイルから
 * 1 枚目を組み立てる（古い行は preview_url を持たない）。それも無ければ空にして、
 * 描く側が枠だけ出す。
 *
 * export はテストのため（応答 → 紙面の対応表を 1 か所に固定する）。
 */
export function toEdition(raw: Record<string, unknown>): PaperEdition | null {
  const id = text(raw.dziJobId || raw.jobId || raw.dzi_job_id || raw.job_id || raw.id);
  if (!id) return null;

  // browse エンドポイントは pages を JSON 文字列で返す（serializeRow を通らない）。
  // Array.isArray だけでは文字列を [] に落とす — coerceDziPages で両形式を正規化。
  const pages = coerceDziPages(raw.pages);
  const first = pages[0];

  const previewUrl =
    text(raw.preview_url || raw.previewUrl) ||
    dziThumbnailUrl(first);

  return {
    id,
    title: text(raw.name || raw.title || raw.publication_name || raw.source_name),
    previewUrl,
    viewerUrl: text(raw.viewer_url || raw.url) || `/deepzoom?jobId=${encodeURIComponent(id)}`,
    pageCount: positive(raw.page_count || raw.pages_count) || pages.length,
    // 紙面日の元。published_at（publish が刻む欄）を先に、無ければ応答の `date`
    // （serializer が completed_at → created_at まで畳んだもの）。**遡って刷った
    // 紙面は刷った日が正** — 取り込みの時刻に負けさせない。
    datedAt: text(raw.published_at || raw.date || raw.completed_at || raw.created_at),
    // 公開日は畳まない生の 1 本（published_at だけ）。datedAt と同じ欄を先に見るが、
    // 落ち先が無い — 無ければ空のまま「公開日は分からない」と言う。
    publishedAt: text(raw.published_at),
    publicationName: text(raw.publication_name),
    edition: text(raw.edition),
    sourceName: text(raw.source_name),
    mediumId: text(raw.medium_id || raw.mediumId),
    faceId: text(raw.face_id || raw.faceId),
    createdAt: text(raw.created_at),
    // MySQL の tinyint は 0/1 で届く。strict equality (!== false) では 0 が true に
    // なるため Boolean() で変換する。null/undefined（古い応答）は公開扱い。
    isPublic: raw.is_public == null ? true : Boolean(raw.is_public),
  };
}
