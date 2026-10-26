// 紙名・版号・紙面日付の唯一の出所。
//
// 題字帯（/home/news）と紙面プレビュー（PaperMock）、編集局面（/dashboard/news）が
// 同じ値を出すために、ここだけが値を持つ。画面側は必ずここから読む。
//
// サーバーとクライアントの両方から読むので "use client" を付けない。
//
// 紙名と版号の基準は**実行時の**環境変数で変えられる（未設定ならここの既定値。ユーザー指示 2026-10-16）。
//   NEWS_PAPER_NAME           題字の紙名                 既定「火星タイムズ ニュース」
//   NEWS_PAPER_NAME_EN        題字の上の英字             既定「Mars Times News」
//   NEWS_EDITION_BASE_DATE    版号の基準日（JST の日）   既定 2026-10-01
//   NEWS_EDITION_BASE_NUMBER  基準日の号数               既定 10000
// イメージは全テナント共用なので NEXT_PUBLIC_* にはしない（ビルド時に焼き込まれる）。
// env を読むのはサーバーだけ（./paperSettings.server.ts）。画面の部品は
// components/press/shared/PaperSettingsContext.tsx の usePaperSettings で受け取り、
// ここの純関数に settings として渡す（layout の GHOST_FRONT_TITLE と同じ考え方）。
// news-job-worker も同じ NEWS_PAPER_NAME を読む（tools/news-worker/lib/paper-name.mjs）。
// テナントごと・媒体ごとの設定（複数媒体・休刊日を含む）は、料金体系と一緒に後で作る。
// また「今日」を描くときは、この純関数を直接呼ばず
// components/press/shared/usePaperDate.ts を経由する（描画のずれを避けるため）。

/** 紙名と版号の基準。値はサーバーが実行時の env から作る（paperSettingsFrom）。 */
export type PaperSettings = {
  /**
   * 題字に出す紙名。架空の紙名（実在の紙名・社名は出さない）。
   * 題字は「日本語が主・英語を上に」（ユーザー指示 2026-09-27）。本体はこちら。
   */
  paperName: string;
  /** 題字の上に小さく添える英字。大文字と字間は画面側で付けるので、綴りだけを持つ。 */
  paperNameEn: string;
  /** 版号の基準日（紙面の日、"2026-10-01"）。この日が editionBaseNumber 号で、1 日 1 号ずつ進む（休刊日はまだ持たない）。 */
  editionBaseDate: string;
  /** 基準日の号数。 */
  editionBaseNumber: number;
};

/** env が無い・読めないときの値。 */
export const DEFAULT_PAPER_SETTINGS: PaperSettings = Object.freeze({
  paperName: "火星タイムズ ニュース",
  paperNameEn: "Mars Times News",
  editionBaseDate: "2026-10-01",
  editionBaseNumber: 10000,
});

/** env の値から設定を作る。空・読めない値はその項目だけ既定に戻す（壊れた号数を出さない）。 */
export function paperSettingsFrom(env: {
  NEWS_PAPER_NAME?: string;
  NEWS_PAPER_NAME_EN?: string;
  NEWS_EDITION_BASE_DATE?: string;
  NEWS_EDITION_BASE_NUMBER?: string;
}): PaperSettings {
  const d = DEFAULT_PAPER_SETTINGS;
  return {
    paperName: envText(env.NEWS_PAPER_NAME, d.paperName),
    paperNameEn: envText(env.NEWS_PAPER_NAME_EN, d.paperNameEn),
    editionBaseDate: envIsoDay(env.NEWS_EDITION_BASE_DATE, d.editionBaseDate),
    editionBaseNumber: envPositiveInt(env.NEWS_EDITION_BASE_NUMBER, d.editionBaseNumber),
  };
}

/**
 * 記事の媒体名。記事に媒体タグ（classification: medium）があればその名前、無ければ紙名
 * （fallback。画面では usePaperSettings().paperName を渡す）。
 */
export function paperNameOf(
  post?: {
    tags?: Array<{name?: string; classification?: string | null}>;
  } | null,
  fallback: string = DEFAULT_PAPER_SETTINGS.paperName,
): string {
  const medium = post?.tags?.find((tag) =>
    String(tag.classification ?? "").trim().toLowerCase() === "medium" &&
    String(tag.name ?? "").trim(),
  );
  return medium?.name?.trim() || fallback;
}

/** 紙面の基準にするタイムゾーン。紙面日付も版号もこの時刻で決まる。 */
export const PAPER_TIMEZONE = "Asia/Tokyo";

function envText(value: string | undefined, fallback: string): string {
  return String(value ?? "").trim() || fallback;
}

function envIsoDay(value: string | undefined, fallback: string): string {
  const text = String(value ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) && Number.isFinite(Date.parse(`${text}T00:00:00Z`)) ? text : fallback;
}

function envPositiveInt(value: string | undefined, fallback: number): number {
  const n = Number(String(value ?? "").trim());
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

/** その瞬間の紙面の日（JST で切った "2026-10-16"）。 */
export function paperIsoDayOf(at: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: PAPER_TIMEZONE,
  }).format(at);
}

/** 紙面日付の綴りはここだけ（paperDay と paperDayLabel が共有する）。 */
function formatPaperDay(at: Date): string {
  const day = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: PAPER_TIMEZONE,
  }).format(at);
  const weekday = new Intl.DateTimeFormat("ja-JP", {
    weekday: "short",
    timeZone: PAPER_TIMEZONE,
  }).format(at);
  return `${day}（${weekday}）`;
}

/**
 * n 日前の紙面日付を「2026年9月26日（土）」の形で返す。
 * offsetDays を省略すると今日。from は試験のために差し替えられる。
 */
export function paperDay(offsetDays = 0, from: Date = new Date()): string {
  const at = new Date(from.getTime() - offsetDays * 24 * 60 * 60 * 1000);
  return formatPaperDay(at);
}

/**
 * 紙面の日そのもの（"2026-09-27"。JST で切った ISO の日）を
 * 「2026年9月27日（日）」の形にする。
 *
 * **過去の記事の紙面日付を出すにはこちら。** paperDay は「今日から何日前」
 * しか受けないので、記事が持っている日（paperDayOf が切った ISO の日）を
 * そのまま渡せるのはこの関数だけ。
 */
export function paperDayLabel(isoDay: string): string {
  const [y, m, d] = String(isoDay).split("-").map((v) => Number(v));
  if (!y || !m || !d) return String(isoDay);
  // その日の正午（日本時間＝03:00Z）で作る。時差で前後の日にずれないため。
  return formatPaperDay(new Date(Date.UTC(y, m - 1, d, 3, 0, 0)));
}

/**
 * 紙面の日（"2026-09-27"）の号数。基準日からの日数を足す（日刊なので 1 日 1 号）。
 * 読めない日なら null。
 */
export function editionNumberOf(isoDay: string, settings: PaperSettings = DEFAULT_PAPER_SETTINGS): number | null {
  const day = Date.parse(`${isoDay}T00:00:00Z`);
  const base = Date.parse(`${settings.editionBaseDate}T00:00:00Z`);
  if (!Number.isFinite(day) || !Number.isFinite(base)) return null;
  return settings.editionBaseNumber + Math.round((day - base) / 86_400_000);
}

/**
 * 紙面の日（"2026-09-27"）の版号「第 10,000 号」。読めない日なら空。
 *
 * **号数は日付だけで決まる**（「今日」に依らない）ので、題字・紙面一覧・過去の紙面で必ず一致する。
 */
export function editionLabelOf(isoDay: string, settings: PaperSettings = DEFAULT_PAPER_SETTINGS): string {
  const number = editionNumberOf(isoDay, settings);
  return number === null ? "" : `第 ${number.toLocaleString("en-US")} 号`;
}

/**
 * n 日前の版号。offsetDays を省略すると今日。from は試験のために差し替えられる。
 *
 * 描画中に呼ぶとサーバーとクライアントで「今日」がずれるので、クライアントの部品は
 * components/press/shared/usePaperDate.ts の usePaperEdition を経由する。
 */
export function editionLabel(
  offsetDays = 0,
  from: Date = new Date(),
  settings: PaperSettings = DEFAULT_PAPER_SETTINGS,
): string {
  return editionLabelOf(paperIsoDayOf(new Date(from.getTime() - offsetDays * 24 * 60 * 60 * 1000)), settings);
}
