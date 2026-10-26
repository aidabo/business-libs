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
