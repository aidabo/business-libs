// 編集局の作業台の純関数。DOM も fetch も知らない（vitest は environment: "node" のまま）。
//
// 面の並び・記号は news/src/core/faces.ts の表が唯一の出所。あの表は **label** を取る
// （slug ではない）。紙面の日は news/src/core/select.ts の paperDayOf 1 本だけを使い、
// 面の判定も同じファイルの faceOf に任せる。読者面と机が別々に判定すると、
// 「読者面には政治と出ている記事を、机が経済に置く」という食い違いが起きる。

import { getDisplayUrl, type MediaInfo } from "../core";
import {
  FACE_TAG_PREFIX,
  FACE_TAG_SUFFIX,
  faceLabelOfTag,
  type Face,
} from "../core";
import { faceOf, paperDayOf } from "../core";
import { PAPER_TIMEZONE } from "../core";

// 面の判定は読者面と 1 本に寄せる（Global Constraint 1）。机の側からも同じ関数を
// 使えるように、ここで再輸出しておく — 触るのは下の 2 行だけで、規則は持たない。
export { faceLabelOfTag } from "../core";
export { faceOf } from "../core";

/**
 * Ghost のタグ 1 本。机が読むのは id / name / slug / visibility / classification。
 *
 * `classification` は机が「媒体」「面」を区別する印で、Ghost の列にそのまま入る
 * （`tools/news-worker/lib/janabiz-faces.mjs` が面タグに付けているのと同じ列）。
 * **机が知らない分類もそのまま持つ** — 消すと他の使い手（例: `AI事業`）の印を壊す。
 */
export type DeskTag = {
  id?: string;
  name: string;
  slug: string;
  visibility?: string | null;
  classification?: string | null;
};

/** 机が扱う記事 1 本。Ghost の posts をそのまま受ける（snake_case のまま）。 */
export type DeskArticle = {
  id: string;
  slug: string;
  title: string;
  status: string;
  /** 読者面が第一面に採る印。**重要度の軸はこれ**（絵ではない）。 */
  featured: boolean;
  feature_image: string | null;
  published_at: string | null;
  updated_at: string;
  /** 記事タブの「作成順」の並べ替えに使う。古い応答・テストの記事には無いことがある。 */
  created_at?: string;
  /** 読み上げの原稿を組むのに使う（Ghost の posts にある素テキスト）。 */
  plaintext: string;
  /**
   * 読者への出し方（Ghost の `posts.visibility`）。**有料・無料の数はこれで数える。**
   * 読者面の口（`POST /api/posts`）は `visibility:public` を必ず前置するので、
   * 会員向けの記事は読者面の一覧に出ない（`useNewsPosts.ts:70`）。
   */
  visibility: string;
  tags: DeskTag[];
  /**
   * 書き手の名前（Ghost の `authors[].name`、並びのまま）。`fields=` を付けると
   * `primary_author` は落ちる（`authors` は残る・実測 2026-10-14）ので `authors` を読む。
   * 古い応答・テストの記事には無いことがある。
   */
  authorNames?: string[];
  /** 書き手の id（`authors[].id`、並びは名前と同じ）。編集できるかの判定（`canEditArticle`）に使う。 */
  authorIds?: string[];
  /**
   * 本文の最初の素材（post_media の role "content" の行で `sort_order` 最小 — `postTransform` の
   * `contentMediaInfo` と同じ物。feature_image の行（role "feature"）は入らない）。Console が
   * 机の一覧に重ねる。`undefined` = まだ読んでいない、`null` = 本文に素材の無い記事。
   */
  bodyMedia?: MediaInfo | null;
};

export type CardType = MediaInfo["type"];

/**
 * カードの種類と、出す素材。**`services/ghost/postTransform.ts`（mapGhostPostToHostPost）と同じ規則**:
 *
 * - 種類 = 本文の最初の素材の種類。本文に素材が無ければ、feature_image があれば "image"、
 *   それも無ければ "text"。**feature_image は種類を決めない** — 動画の記事に feature_image が
 *   あっても動画で、feature_image はその poster（ユーザー指摘 2026-10-14）。
 * - `media` = 再生・表示する物。動画・音声は本文の素材。画像は `getMediaInfo` の順
 *   （feature_image、無ければ本文の画像）。text は null。
 * - `poster` = `<img>` / poster に載せる URL。feature_image が先、無ければ `getDisplayUrl`
 *   （動画は thumbnail、画像はそのもの）。動画の URL・音声の置き絵（このアプリに無い）は載せない。
 *
 * `bodyMedia` がまだ読めていない（undefined）間は、feature_image だけで判る分（image か text）。
 */
export function cardOf(
  article: Pick<DeskArticle, "feature_image" | "bodyMedia">
): { type: CardType; media: MediaInfo | null; poster: string | null } {
  const featureUrl = String(article.feature_image ?? "").trim();
  const feature: MediaInfo | null = featureUrl ? { type: "image", url: featureUrl } : null;
  const body = article.bodyMedia ?? null;
  const type: CardType = body ? body.type : feature ? "image" : "text";
  if (type === "text") return { type, media: null, poster: null };
  const display = feature ?? body; // getMediaInfo の順
  const shown = display && (display.type === "image" || (display.type === "video" && display.thumbnailUrl))
    ? getDisplayUrl(display)
    : null;
  if (type === "image") return { type, media: display, poster: shown };
  return { type, media: body, poster: shown };
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** 応答から表を引く。鍵の名は口によって違うので候補を順に当たる。 */
export function rowsOf(payload: unknown, ...keys: string[]): unknown[] {
  const root = asRecord(payload);
  if (!root) return [];
  for (const key of keys) {
    const value = root[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

/**
 * 失敗の文。**Ghost の言い分をそのまま出す。**
 * 机には「会員数 11,204」「購読者 4,210」のような作り値があった。数字が出せないときは
 * 数字を消して理由を出す（spec §4.0・§5）。
 */
export function errorText(payload: unknown, fallback: string): string {
  const row = asRecord(rowsOf(payload, "errors")[0]);
  const message = asText(row?.context).trim() || asText(row?.message).trim();
  return message || fallback;
}

export function toDeskTag(raw: unknown): DeskTag | null {
  const row = asRecord(raw);
  if (!row) return null;
  const name = asText(row.name).trim();
  const slug = asText(row.slug).trim();
  if (!name && !slug) return null;
  return {
    id: asText(row.id).trim() || undefined,
    name,
    slug,
    visibility: asText(row.visibility).trim() || null,
    classification: asText(row.classification).trim() || null,
  };
}

export function toDeskTags(raw: unknown): DeskTag[] {
  if (!Array.isArray(raw)) return [];
  const out: DeskTag[] = [];
  for (const item of raw) {
    const tag = toDeskTag(item);
    if (tag) out.push(tag);
  }
  return out;
}

/** Ghost の記事 1 本を写す。id が無いものは記事として扱わない。 */
export function toDeskArticle(raw: unknown): DeskArticle | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asText(row.id).trim();
  if (!id) return null;
  return {
    id,
    slug: asText(row.slug),
    title: asText(row.title),
    status: asText(row.status),
    featured: row.featured === true,
    feature_image: asText(row.feature_image).trim() || null,
    published_at: asText(row.published_at).trim() || null,
    updated_at: asText(row.updated_at),
    created_at: asText(row.created_at).trim() || undefined,
    plaintext: asText(row.plaintext),
    visibility: asText(row.visibility).trim(),
    tags: toDeskTags(row.tags),
    authorNames: authorFieldOf(row.authors, row.primary_author, "name"),
    authorIds: authorFieldOf(row.authors, row.primary_author, "id"),
  };
}

/** 書き手の名前／id。`authors` が無ければ `primary_author` を見る。値の無い行は数えない。 */
function authorFieldOf(authors: unknown, primary: unknown, key: "name" | "id"): string[] {
  const list = Array.isArray(authors) ? authors : primary ? [primary] : [];
  return list.map((a) => asText(asRecord(a)?.[key]).trim()).filter((value) => value !== "");
}

// ---- 編集できるか ------------------------------------------------------------

/** 見ている人（セッションの user id と Ghost のロール名）。 */
export type DeskViewer = { userId: string; roles: string[] };

/** どの記事でも編集できるロール（Ghost の `post.permissible` で制限の掛からない側）。 */
const EDIT_ANY_ROLES = ["Owner", "Administrator", "Super Editor", "Editor"];

/**
 * この人がこの記事を編集できるか。**Ghost の規則をそのまま写す**（画面で押せるのに
 * PUT が 403 になる、を作らない）:
 *
 * - Owner / Administrator / Super Editor / Editor — どの記事も。
 * - Author — 共著者（`authors` に自分が居る）の記事。状態は問わない
 *   （`relations/authors.js` permissible: `isAuthor && isEdit` → `isCoAuthor()`）。
 * - Contributor — 共著者で、かつ**下書き**の記事だけ（同 `isCoAuthor()` +
 *   `post.js` permissible: `isContributor && isEdit` → `isDraft()`）。
 *
 * 分からない人（null・ロール無し）には「できる」と言わない。
 */
export function canEditArticle(
  viewer: DeskViewer | null | undefined,
  article: Pick<DeskArticle, "status" | "authorIds">
): boolean {
  if (!viewer) return false;
  if (viewer.roles.some((role) => EDIT_ANY_ROLES.includes(role))) return true;
  const isCoAuthor = viewer.userId !== "" && (article.authorIds ?? []).includes(viewer.userId);
  if (!isCoAuthor) return false;
  if (viewer.roles.includes("Author")) return true;
  return viewer.roles.includes("Contributor") && article.status === "draft";
}

// ---- 状態 --------------------------------------------------------------------

export type ArticleState = "published" | "scheduled" | "overdue" | "draft";

export const STATE_LABEL: Record<ArticleState, string> = {
  published: "公開",
  scheduled: "予約",
  overdue: "予約（時刻を過ぎています）",
  draft: "下書き",
};

/**
 * 記事の状態。**予約の時刻を過ぎているのに公開されていないものは `overdue`。**
 * Ghost の scheduler が止まっていると、予約したまま表に出ない記事ができる。
 * 机はそれを赤で出して、人が気づけるようにする（spec §4.1・V11）。
 */
export function stateOf(
  article: Pick<DeskArticle, "status" | "published_at">,
  now: Date
): ArticleState {
  const status = article.status.trim().toLowerCase();
  if (status === "published" || status === "sent") return "published";
  if (status === "scheduled") {
    const at = article.published_at ? new Date(article.published_at).getTime() : Number.NaN;
    return Number.isFinite(at) && at <= now.getTime() ? "overdue" : "scheduled";
  }
  return "draft";
}

/** 「10/2 06:00」の形。紙面の時刻は JST で読む（端末の時計に合わせない）。 */
export function stampLabel(iso: string | null, timeZone: string = PAPER_TIMEZONE): string {
  if (!iso) return "";
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";
  const parts = new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    // hour12: false だと深夜 0 時が「24」になる環境があるので h23 を使う
    hourCycle: "h23",
    timeZone,
  }).formatToParts(at);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("month")}/${get("day")} ${get("hour")}:${get("minute")}`;
}

/**
 * 記事の紙面日（JST の YYYY-MM-DD）。
 *
 * **列 `posts.edition_date` を使う日が来たら、直すのはここ 1 か所**（spec §3.2・§3.3 は保留）。
 * 下書きと予約は published_at を持たないので updated_at で代用する — まだ紙面に無い記事は
 * 「最後に触った日」の束に入る。
 */
export function paperDayOfPost(article: Pick<DeskArticle, "published_at" | "updated_at">): string {
  const value = article.published_at ?? article.updated_at;
  return value ? paperDayOf(value) : "";
}

/** いまの紙面日。紙面タブが既定で開く日。 */
export function todayPaperDay(now: Date): string {
  return paperDayOf(now.toISOString());
}

export type PaperDay = { day: string; articles: DeskArticle[] };

const timeOf = (iso: string | null): number => (iso ? new Date(iso).getTime() || 0 : 0);

const byNewest = (a: DeskArticle, b: DeskArticle): number =>
  timeOf(b.published_at) - timeOf(a.published_at);

/** 紙面日で束ねる。新しい日が先。束の中は公開の新しい順。 */
export function groupByPaperDay(articles: DeskArticle[]): PaperDay[] {
  const byDay = new Map<string, DeskArticle[]>();
  for (const article of articles) {
    const day = paperDayOfPost(article);
    if (!day) continue;
    const list = byDay.get(day);
    if (list) list.push(article);
    else byDay.set(day, [article]);
  }
  return [...byDay.entries()]
    .map(([day, list]) => ({ day, articles: [...list].sort(byNewest) }))
    .sort((a, b) => b.day.localeCompare(a.day));
}

/**
 * 公開したあとに手が入ったか（読者面の `isUpdated` と同じ物差し = 紙面日で比べる）。
 *
 * **下書きには印を付けない。** 読者面の isUpdated は published_at が null の記事を
 * 想定していない（null は 1970 年として読まれ、必ず「更新あり」になる）。机は下書きも
 * 並べるので、公開済みのときだけ true にする。
 */
export function replacedOf(
  article: Pick<DeskArticle, "status" | "published_at" | "updated_at">,
  now: Date
): boolean {
  if (stateOf(article, now) !== "published") return false;
  if (!article.published_at) return false;
  // 空の updated_at をそのまま渡すと `paperDayOf` が投げる（読めない = 印を付けない）
  if (!article.updated_at) return false;
  return paperDayOf(article.updated_at) > paperDayOf(article.published_at);
}

// ---- 主役 --------------------------------------------------------------------

/** 第一面が採る本数。読者面の `selectFrontPage` と同じ 6（news/src/core/select.ts:196）。 */
export const FRONT_PAGE_LIMIT = 6;

/** 主役を立てられる最小の形（読者面の Post も机の DeskArticle も渡せる）。 */
export type FrontCandidate = {
  id: string;
  title: string;
  featured: boolean;
  published_at: string | null;
};

/**
 * 読者面の第一面が数える相手。**渡す前にこの 1 本を通す。**
 *
 * 読者面は `useNewsPosts.ts` の 1 本の問い合わせで記事を取る — `status:[published,sent]` で、
 * `tag:[面の slug…]`。つまり第一面に並ぶのは**公開されていて、面が付いている記事だけ**で、
 * **日は跨ぐ**（`selectFrontPage` は日を見ない）。
 *
 * ここを 1 日で閉じたり下書きを混ぜたりすると、「7 本目は落ちます」が嘘になる。
 * 下書きを数えれば**落ちないのに警告**し、別の日の 7 本目を数えなければ**落ちるのに黙る**。
 * 面の付いていない記事も同じ — 読者面は面タグで引くので、その記事は第一面に並ばない。
 *
 * 予約（`scheduled`）は入らない。まだ読者に出ていないので、主役の座を取っていない。
 * 時刻を過ぎたまま公開されていない `overdue` も同じ（`isOnReader` は status だけを見る）。
 *
 * **会員向け（`members` / `paid` / `tiers`）も入らない。** 読者面の口は条件の先頭に
 * `visibility:public` を必ず足す（`app/api/posts/route.ts:246,253-258`）。机は admin の口で
 * 全状態・全 visibility を読むので、ここで絞らないと**読者面に並ばない記事を数えて、
 * 落ちないのに警告**する（下書きを数えるのと同じ誤り）。
 */
export function frontPageCandidates(articles: DeskArticle[]): DeskArticle[] {
  return articles.filter(
    (article) => isOnReader(article) && accessOf(article) === "public" && hasReaderFace(article)
  );
}

/**
 * 記事が読者面の面に載っているか。**読者面の取り込みと同じ規則。**
 *
 * 読者面は面タグを `/api/tags?classification=face` で引き、その slug で記事を引く
 * （`useNewsPosts.ts:31,46-60,108`）。つまり読者面が面と見なすのは
 * **印（`classification: "face"`）と名前の形（`#◯◯面`）の両方**を満たすタグだけ。
 *
 * 名前の形だけで見ると（`faceLabelOf`）、`#政治面` という名前でも印の無いタグを付けた
 * 記事を数えてしまう — その記事は読者面のどこにも出ないので、**落ちないのに
 * 「第一面は 6 本まで」と警告する**。逆に読者面に出る記事は必ず両方を持つので、
 * 数え落としは起きない（向きは過大評価のみだった）。
 *
 * 記事のタグには `classification` がそのまま載る（実測 2026-10-03:
 * `GET /ghost/api/admin/posts/?include=tags` のタグに `classification: "face"` が入る）。
 * 実データの面タグ 9 本は 9 本とも印が立っているので、この判定は実データでは
 * `faceLabelOf` と一致する（差が出るのは手で作ったタグだけ）。
 */
export function hasReaderFace(article: Pick<DeskArticle, "tags">): boolean {
  return article.tags.some(
    (tag) => tagMarkOf(tag) === "face" && faceLabelOfTag(tag) !== null
  );
}

/**
 * 主役を立てすぎたとき、**第一面から落ちる**記事（新しい順で 7 本目以降）。
 *
 * 規則の出所は読者面の `selectFrontPage`（`[...featured, ...rest].slice(0, 6)`）。
 * あちらは Post 型、こちらは DeskArticle なので関数は共有できないが、切り方は同じで、
 * 試験で `selectFrontPage` / `frontPageIds` と突き合わせてある（V10）。
 *
 * **渡すのは `frontPageCandidates` を通した集合。** ここは「並んだ 6 本からあふれた分」を
 * 数えるだけなので、読者面に出ない記事を混ぜると数が狂う。
 */
export function featuredOverflow<T extends FrontCandidate>(
  articles: T[],
  limit: number = FRONT_PAGE_LIMIT
): T[] {
  return articles
    .filter((article) => article.featured)
    .sort((a, b) => timeOf(b.published_at) - timeOf(a.published_at))
    .slice(limit);
}

// ---- タグの組み直し（V12） ----------------------------------------------------

export type TagRefit = {
  /** 面を置き換える。`null` で面を外す。**省略すると面は触らない。** */
  face?: string | null;
  /** 媒体タグを置き換える。`null` で媒体を外す。省略すると触らない。 */
  medium?: string | null;
  /**
   * 媒体タグの slug の一覧（`/api/tags?classification=medium` の実データ）。
   * **面と違って「媒体かどうか」はタグ自身から分からない**（名前に印が無い）ので、
   * 「いまの媒体を外す」にはこの表が要る。
   */
  mediumSlugs?: string[];
};

/**
 * いまのタグを保ったまま、Ghost に送る `tags` を組む。
 *
 * ⚠️ **Ghost の `PUT /posts/{id}/` に `tags` を入れると、その配列が記事のタグ全体になる。**
 * 面を 1 つ足すだけのときも、いま付いているタグを全部入れて送る。種記事の投入で
 * `[公開タグ, 面タグ]` の 2 本だけを送って中分類（議会・野球…）が消え、`updated_at` だけが
 * 進んで読者面に「差し替え」の印が付く事故が実際に起きた（spec §2.1 C2・V12）。
 */
export function refitTags(tags: DeskTag[], refit: TagRefit): { slug: string }[] {
  const dropFace = "face" in refit;
  const mediumSlugs = new Set(refit.mediumSlugs ?? []);
  const dropMedium = "medium" in refit;

  const out: { slug: string }[] = [];
  const push = (slug: string) => {
    if (slug === "") return;
    if (out.some((kept) => kept.slug === slug)) return;
    out.push({ slug });
  };

  for (const tag of tags) {
    if (dropFace && faceLabelOfTag(tag) !== null) continue;
    if (dropMedium && mediumSlugs.has(tag.slug)) continue;
    push(tag.slug);
  }
  if (dropFace && refit.face) push(refit.face);
  if (dropMedium && refit.medium) push(refit.medium);
  return out;
}

// ---- 割付（面・媒体・主役・絵） ----------------------------------------------
//
// **公開・予約・下書きはここに無い。** 記事を書く・編集する・公開する（予約公開も）は
// 既存の `/editor`（`components/demo/EditorComponent.tsx`）と `/panel` が受け持つ。
// 机が持つのは割付だけ — どの面に載せるか、媒体はどれか、主役か、絵はどれか。
// 机が公開まで持つと、同じ操作の口が 2 つになり、片方だけ直したときに食い違う
// （2026-10-02 の実測で `publishBody` は誰も使わないまま残っていた）。

export type WriteDraft = {
  /** 面の slug。"" = 面を外す。 */
  faceSlug: string;
  /** 媒体の slug。"" = 媒体を外す。 */
  mediumSlug: string;
  featured: boolean;
  /** feature_image。"" = 絵を外す。 */
  featureImage: string;
};

export type WritePlan = {
  /** Ghost に送る体（変わる欄だけ）。空なら書かない。 */
  patch: Record<string, unknown>;
  /** 何がどう変わるかの文。確認の 1 枚にそのまま出す。 */
  lines: string[];
};

const faceLabelOf = (article: DeskArticle): string =>
  article.tags.map((tag) => faceLabelOfTag(tag)).find((label) => label !== null) ?? "";

/** 面の slug → label。面タグの表（`/api/tags?classification=face`）から引く。 */
export function faceLabelOfSlug(slug: string, faces: Face[]): string {
  return faces.find((face) => face.slug === slug)?.label ?? "";
}

/** 記事に付いている面タグの slug（"" = 面が無い）。机と `WriteDialog` が同じ 1 本を使う。 */
export function faceSlugOfArticle(article: Pick<DeskArticle, "tags">): string {
  return faceOf(article)?.slug ?? "";
}

/** 記事に付いている媒体タグ（null = 媒体が無い）。下の 2 本が同じ 1 本の判定を使う。 */
const mediumOfArticle = (article: DeskArticle, mediums: DeskTag[]): DeskTag | null =>
  article.tags.find((tag) => mediums.some((medium) => medium.slug === tag.slug)) ?? null;

/**
 * **ニュースの記事か**（/dashboard/news に載せるか。ユーザー決定 2026-10-15）。面のタグ（`faceOf`
 * — 読者面と同じ面の表）**か**媒体のタグ（`mediums` = 印が medium のタグ）の**どちらか**があれば
 * ニュース。どちらも無い投稿（物件・家族・試しの「(Untitled)」など）は机に載せない。
 * 机が載せる記事の判定はこの 1 本だけ（`useDesk` が読んだ直後に 1 回だけ当てる）。
 */
export function isNewsArticle(article: DeskArticle, mediums: DeskTag[]): boolean {
  return faceOf(article) !== null || mediumOfArticle(article, mediums) !== null;
}

/** 記事に付いている媒体タグの slug（"" = 媒体が無い）。すぐ上の `faceSlugOfArticle` と対。 */
const mediumSlugOfArticle = (article: DeskArticle, mediums: DeskTag[]): string =>
  mediumOfArticle(article, mediums)?.slug ?? "";

/**
 * 一覧に出す媒体の名。
 *
 * **机が媒体を 1 つも知らないときは "" を返す。** そのときは、記事に付いているタグの
 * どれが媒体なのかを机は区別できない。「媒体なし」と書くと、区別できないことを
 * 「付いていない」と断定したことになる。
 */
export function mediumLabelOfArticle(article: DeskArticle, mediums: DeskTag[]): string {
  if (mediums.length === 0) return "";
  return mediumOfArticle(article, mediums)?.name ?? "媒体なし";
}

/**
 * 読者に出ているか。**`stateOf` と同じ語彙**（`published` と `sent` を同じ扱いにする）。
 *
 * 読者面の取得は `status:[published,sent]` で引く（`useNewsPosts.ts:70`）。ここで `published`
 * だけを数えると `sent` の記事が主役の勘定から抜けて、「7 本目は落ちます」が嘘になる（R26）。
 */
const isOnReader = (article: Pick<DeskArticle, "status">): boolean => {
  const status = article.status.trim().toLowerCase();
  return status === "published" || status === "sent";
};


/**
 * 新規記事の割付に出す面の選択肢。**Ghost に実在するタグを持つ面だけを出す。**
 *
 * 名前は `faceTagNameOf(label)` で組み立てず、**机が読んだタグそのものから取る**。`#` と `面` は
 * `faces.ts` の表が唯一の出所なので組んでも同じ字になるが、**そのタグが在るかどうか**は
 * タグを読まないと分からない。実在しない名前を選択肢に載せると、`/editor` 側の
 * `filterByNames` が保存の直前に黙って落とし、「選んだのに付かない」になる。
 *
 * slug を持たない面は**出さない**。slug で引く以上、空の slug は「最初の slug 空タグ」に
 * 当たって**別のタグの名前**を載せてしまう（Ghost は slug を必ず振るので実データでは
 * 起きないが、入口を開けておく理由が無い）。
 */
export function faceChoicesOf(
  faces: Face[],
  tags: DeskTag[]
): { slug: string; label: string; name: string }[] {
  return faces.flatMap((face) => {
    if (face.slug === "") return [];
    const name = tags.find((tag) => tag.slug === face.slug)?.name ?? "";
    return name === "" ? [] : [{ slug: face.slug, label: face.label, name }];
  });
}

/**
 * 机の「新しく書く」が開く `/editor` の口。**選ばなくても開ける**（ユーザー指示 2026-10-04
 * 「選択なしでも可」）。
 *
 * **タグの名前で渡す。** `/editor` の `?tagname=` は名前を選んだ物として扱い、保存の直前に
 * 取ってきたタグ表と突き合わせる（`/tag` の「新しい投稿」が使っているのと同じ道）。slug では
 * 合わない。名前は `%23政治面` のように符号化する — **生の `#` は URL の fragment になり、
 * 名前が黙って消える**。
 */
export function newArticleEditorHref(mediumName: string, faceName: string): string {
  const params = new URLSearchParams();
  for (const name of [mediumName, faceName]) {
    const trimmed = name.trim();
    if (trimmed !== "") params.append("tagname", trimmed);
  }
  const query = params.toString();
  return query === "" ? "/editor/" : `/editor/?${query}`;
}

/**
 * 何を書くかを組む。**変わっていない欄は入れない。**
 *
 * `faces` は面タグの表（面の付け替えを「政治 → 経済」の label で出すのに使う）。
 * `siblings` は**第一面に並ぶ記事**（`frontPageCandidates` を通した全記事）。
 * 1 日で閉じてはいけない — 読者面の第一面は日を跨ぐ（`selectFrontPage`）。
 */
export function buildWritePlan(
  article: DeskArticle,
  draft: WriteDraft,
  faces: Face[],
  mediums: DeskTag[],
  siblings: FrontCandidate[]
): WritePlan {
  const patch: Record<string, unknown> = {};
  const lines: string[] = [];

  const faceNow = faceSlugOfArticle(article);
  const mediumNow = mediumSlugOfArticle(article, mediums);
  const imageNow = article.feature_image ?? "";

  const faceChanged = draft.faceSlug !== faceNow;
  const mediumChanged = draft.mediumSlug !== mediumNow;
  if (faceChanged || mediumChanged) {
    patch.tags = refitTags(article.tags, {
      ...(faceChanged ? { face: draft.faceSlug || null } : {}),
      ...(mediumChanged
        ? { medium: draft.mediumSlug || null, mediumSlugs: mediums.map((m) => m.slug) }
        : {}),
    });
  }
  if (faceChanged) {
    const from = faceLabelOf(article) || "なし";
    const to = draft.faceSlug ? faceLabelOfSlug(draft.faceSlug, faces) || "なし" : "なし";
    lines.push(`面: ${from} → ${to}`);
    // 面を外すと読者面のどの面にも出なくなる（読者面は面タグで絞る）。黙って外させない。
    if (!draft.faceSlug) {
      lines.push("⚠ 面が付いていません。この記事は読者面のどの面にも出ません。");
    }
  }
  if (mediumChanged) {
    // 媒体も**文を必ず出す**。文が 0 行だと WriteDialog は「変わっていない」と見て確認を出さず、
    // patch.tags は組んだのに黙って書かれなかった（2026-10-13 ユーザー報告）。
    const nameOf = (slug: string) => mediums.find((m) => m.slug === slug)?.name || slug;
    const from = mediumNow ? nameOf(mediumNow) : "なし";
    const to = draft.mediumSlug ? nameOf(draft.mediumSlug) : "なし";
    lines.push(`媒体: ${from} → ${to}`);
  }

  if (draft.featured !== article.featured) {
    patch.featured = draft.featured;
    lines.push(draft.featured ? "主役: 立てる" : "主役: 降ろす（第一面から外れます）");
    if (draft.featured) {
      // **自分を数に入れるのは、この書きのあと第一面に並ぶときだけ。** 読者面は
      // 公開されていて面の付いた記事しか取らない（`frontPageCandidates`）ので、
      // 下書きや面の無い記事を数えると「落ちます」と言いながら何も落ちない。
      // 面は**この書きのあとの姿**で見る（面を付けながら主役に立てる書きがある）。
      const onReaderAfter = isOnReader(article) && draft.faceSlug !== "";
      if (!onReaderAfter) {
        lines.push(
          "⚠ この記事はまだ読者面の第一面に並びません（公開前か、面が付いていません）。第一面に出るのは公開されてからです。"
        );
      } else {
        const dropped = featuredOverflow([
          ...siblings.filter((s) => s.id !== article.id),
          {
            id: article.id,
            title: article.title,
            featured: true,
            published_at: article.published_at,
          },
        ]);
        if (dropped.length > 0) {
          lines.push(
            `⚠ 主役が ${FRONT_PAGE_LIMIT} 本を超えます。第一面から落ちる記事: ${dropped
              .map((d) => `「${d.title}」`)
              .join("")}`
          );
        }
      }
    }
  }

  const imageNext = draft.featureImage.trim();
  if (imageNext !== imageNow) {
    patch.feature_image = imageNext || null;
    lines.push(imageNext ? "絵: 入れ替える" : "絵: 外す");
  }

  return { patch, lines };
}

/**
 * 送る直前に `updated_at` を載せる。**記事の書きの組み立て（`api.ts` の `postWriteRequest`）だけが呼ぶ。**
 *
 * Ghost の admin API は posts の edit に `updated_at` を必須で要求する
 * （`@tryghost/admin-api-schema` の posts-edit.json: "required": ["updated_at"]）。
 * 送らないと入力検証で 422 になり、机の書きが全部落ちる（実測 2026-10-02）。
 *
 * 値は**読んだときのもの**をそのまま返す — 古ければ Ghost が 409 を返し、机はその言い分を
 * 赤帯に出す（`読み直す` で直せる）。衝突検知に乗るので、他の人が触った記事を黙って上書きしない。
 * 変える欄が無い `{}` には載せない（「変わっていない欄は送らない」を壊さない）。
 *
 * **`buildWritePlan` の側には載せない。** 素材タブの 2 本（絵の差し替え・削除）のように
 * `buildWritePlan` を通らない書き口があり、載せ場が 2 つあると次に書き口が増えたときに
 * どちらを見るか分からなくなる（2026-10-02 に素材タブだけ 422 のまま残った）。
 */
export function withUpdatedAt(
  article: Pick<DeskArticle, "updated_at">,
  patch: Record<string, unknown>
): Record<string, unknown> {
  if (Object.keys(patch).length === 0) return patch;
  return { ...patch, updated_at: article.updated_at };
}

// ---- 読み上げの原稿 ----------------------------------------------------------

/** 読み上げの原稿を本文から組む（1 文 1 要素）。空の文は入れない（worker が断る）。 */
export function scriptFromPlaintext(plaintext: string): string[] {
  return String(plaintext ?? "")
    .split(/\r?\n+/)
    .flatMap((line) => line.split(/(?<=[。．！？!?])/))
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

/**
 * 読み上げの履歴が読めなかったときの断り書き。
 *
 * **失敗の文ではない。** 履歴が読めないと印が付かないだけで、原稿を積むことはできる
 * （`NewsAgentSettingsPanel` の同じ場面と同じ規則 — あちらにも「ここで error を出さない」
 * と書いてある）。だから `DeskError`（赤帯）ではなく `DeskEmpty`（淡い 1 行）に渡す。
 */
export function jobsUnavailableNote(message: string): string {
  const reason = String(message ?? "").trim();
  const head = reason ? `読み上げの履歴を読めませんでした（${reason}）。` : "読み上げの履歴を読めませんでした。";
  return `${head}印が出ないだけで、積むことはできます。`;
}

/**
 * 読めなかったときの机の姿。**1 つの値として返す。**
 *
 * `useDesk` が配列を別々に空にする形にすると、どれか 1 つを消し忘れたときに
 * 古い値が残り、それが「いまの数字」として画面に出る。作り値を消した意味が無くなるので、
 * **失敗の姿はここ 1 か所で組む**（spec §4.0・V6）。`DeskError` に渡す理由もここで決める
 * — 空の理由で赤帯に何も出ないのを避ける。
 */
export function deskUnavailable(message: string): {
  status: "error";
  error: string;
  articles: DeskArticle[];
  tags: DeskTag[];
} {
  const reason = String(message ?? "").trim();
  return {
    status: "error",
    error: reason || "Ghost から取れませんでした",
    articles: [],
    // 面も媒体も `tags` から導く（`useDesk`）。ここで空にしておけば、導いた先も空になる。
    tags: [],
  };
}

/**
 * 一覧の見え方。**「まだ無い」と「取れなかった」を混ぜない**（spec §4.0・V5）。
 *
 * 4 つは画面では別の文になる。三項演算子を直に並べると、順番を入れ替えただけで
 * 「取れなかった」が「まだ無い」に化ける — 素材タブでそれが起きると、編集者は
 * **gallery が壊れているのに「素材が 0 件だ」と読んで、要らない絵を上げ直す**。
 * 判定を 1 つの関数に出しておけば、描画試験が useEffect を走らせなくてもここで押さえられる。
 *
 * `error` を先に見るのは、失敗のときにたまたま残った件数を出さないため。
 */
export type LoadView = "loading" | "error" | "empty" | "rows";

export function loadView(rowCount: number | null, error: string | null): LoadView {
  if (error !== null) return "error";
  if (rowCount === null) return "loading";
  return rowCount === 0 ? "empty" : "rows";
}

// ---- 媒体の slug（spec §4.5） -------------------------------------------------

/**
 * 人が読める ASCII の語を組む。**Ghost に任せない** — Ghost は日本語を翻字して
 * `medium-huo-xing-tai-mu-zu` のような読めない語にする（spec §4.5）。
 */
function slugifyAscii(name: string): string {
  const base = name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `tag-${hashName(name)}`;
}

/**
 * 名前から作る短い印。**同じ名前なら必ず同じ値**にする。
 *
 * 時刻（`Date.now()`）を使うと、確認画面に出した slug と、押した瞬間に作られる slug が
 * **別の値になる**（押すたびに変わる値を人に見せることになる）。ここは純関数にする。
 */
function hashName(name: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < name.length; i += 1) {
    hash ^= name.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

/**
 * 媒体タグの slug を決める。人が打った語があればそれを、無ければ名前から組む。
 * 頭の `medium-` は 1 つに畳む。
 *
 * **確認画面に出す値と、実際に作る値は、この 1 つの関数が決める**（片方だけ直すと、
 * 見せた slug と違う slug のタグができる）。日本語の名前で人が打たなかったときは
 * `medium-tag-<8 桁>` になる — **読めない語を Ghost に作らせるより、机が決めて画面に出す**。
 *
 * **trim はこの中でやる。** 呼び側に任せると、確認画面（生の値）と作成（trim 済み）で
 * 別々に落とすことになり、`^medium-` を外す**前に**空白があると外し損ねて
 * `medium-medium-mars-times` になる（名前側も、末尾の空白で印の hash が変わってしまう）。
 * 呼び側で揃える手は採れない — 確認画面（`ConfirmSheet`）は `open=false` で `null` を返し、
 * `renderToStaticMarkup` は押せないので、**この repo では試験から届かない**。
 * ここに 1 つ置けば、どちらの呼び方でも同じ値になる（試験で押さえられる）。
 */
export function mediumSlugOf(name: string, typed: string = ""): string {
  const chosen = typed.trim() === "" ? name : typed;
  const raw = chosen.trim().replace(/^medium-/, "");
  return `medium-${slugifyAscii(raw)}`;
}

// ---- 媒体と紙面の印 ----------------------------------------------------------
//
// 媒体も紙面も Ghost のタグ 1 本で持つ。区別はタグの列 `classification` の値だけ
// （別テーブルは作らない — 2026-10-03 に実測して決めた）。面タグには
// `tools/news-worker/lib/janabiz-faces.mjs` が既に `face` を入れており、机は同じ列に
// `medium` を入れる。**読者面が面を見つけるのは名前の形**（`faceLabelOfTag`）なので、
// 印だけ付けても読者面には出ない — 名前が `#◯◯面` であることが要る。

export const MEDIUM_CLASSIFICATION = "medium";
export const FACE_CLASSIFICATION = "face";

/**
 * タグ 1 本の印。机が扱うのは 3 つ + **知らない印**。
 *
 * `other` を潰さない: 実データには `AI事業` の印が付いたタグが 1 本ある（2026-10-03 実測、
 * 全 96 本のうち印付きは 10 本 = 面 9 + これ 1）。「媒体か紙面か」の 2 択で書き戻すと消える。
 *
 * **机は `other` を黙って書き換えない**（印の口をそのまま送る `setTagMark` は `medium` と
 * `face` しか受け取らない）。置き換えるときは `markPlan` が値を名指しした 1 枚を挟む —
 * 戻す口がどこにも無いので（Ghost のタグ画面にもこの列は無い）、押し間違いを後から直せない。
 */
export type TagMark = "none" | "medium" | "face" | "other";

export const MARK_LABEL: Record<TagMark, string> = {
  none: "—",
  medium: "媒体",
  face: "紙面",
  other: "その他",
};

export function tagMarkOf(tag: Pick<DeskTag, "classification">): TagMark {
  const value = String(tag.classification ?? "").trim().toLowerCase();
  if (value === MEDIUM_CLASSIFICATION) return "medium";
  if (value === FACE_CLASSIFICATION) return "face";
  return value === "" ? "none" : "other";
}

/** `#` と末尾の `面` を落として、人が打った面名だけにする（重なっていても 1 つに畳む）。 */
export function faceBareName(name: string): string {
  return String(name ?? "")
    .trim()
    .replace(/^#+/, "")
    .replace(/面+$/, "")
    .trim();
}

/**
 * 人が打った面名から面タグの名（`#社会面`）を組む。空なら ""（送らない）。
 *
 * `#` は `FACE_TAG_PREFIX`、`面` は `FACE_TAG_SUFFIX`（faces.ts の表）。**この 2 つは
 * あの表が唯一の出所**で、読者面の探索（`faceLabelOfTag`）も同じ表を使う。ここで直書き
 * すると、片方だけ直したときに「机には出るが読者面には出ない面」ができる。
 */
export function faceTagNameOf(label: string): string {
  const bare = faceBareName(label);
  return bare === "" ? "" : `${FACE_TAG_PREFIX}${bare}${FACE_TAG_SUFFIX}`;
}

/**
 * 面タグの slug を決める。人の語があればそれを、無ければ面名から組む。頭の `face-` は 1 つに畳む。
 * `mediumSlugOf` と対（片方だけ直すと、見せた slug と違う slug のタグができる）。
 */
export function faceSlugOf(label: string, typed: string = ""): string {
  const chosen = typed.trim() === "" ? faceBareName(label) : typed;
  const raw = chosen.trim().replace(/^face-/, "");
  return `face-${slugifyAscii(raw)}`;
}

export type RenamePlan = {
  /** 送る名前（前後の空白を落としたもの）。 */
  name: string;
  lines: string[];
  /** 送れるか。**同じ名前なら false**（書く理由が無い）。 */
  ok: boolean;
};

/**
 * タグの改名の体。**確認の 1 枚に出す値をこの 1 本が決める**（`newTagPlan` と同じ理由）。
 *
 * 面タグの名前を崩すと**読者面から消える**。読者面は名の形（`#◯◯面`）で面を見つけるので、
 * `#政治面` → `政治` にすると、その面は読者面のどこにも出なくなる。印は `face` のままなので、
 * 机の一覧には「紙面」と出たままになる（一覧を見ても気づけない）。**書き終わってから
 * 断り書きを出しても遅い**（もう読者面から消えている）ので、書く前にここで出す。
 *
 * `#` で始まる名前にすると Ghost が可視性を internal に落とす（`tag.js` の `onSaving`）。
 * 面タグは元から internal なので変わらないが、公開タグを `#` で始まる名前にすると
 * 読者から見えなくなる。**変わるときだけ**断る（毎回出すとただの飾りになる）。
 */
export function renamePlan(tag: DeskTag, typed: string): RenamePlan {
  const name = typed.trim();
  const mark = tagMarkOf(tag);
  if (name === "") return { name, lines: ["⚠ 名前が要ります。"], ok: false };

  const lines = [`名前: ${tag.name} → ${name}`];
  lines.push(`slug: ${tag.slug}（変わりません — URL が変わるため）`);
  if (mark === "face" && faceTagNameOf(name) !== name) {
    lines.push(
      `⚠ 面タグの名前が「#◯◯面」の形でなくなります。読者面は名前の形で面を見つけているので、` +
        `このタグは読者面のどの面にも出なくなります（直すなら「${faceTagNameOf(name) || "#◯◯面"}」）。`
    );
  }
  if (name.startsWith("#") && (tag.visibility ?? "") !== "internal") {
    lines.push(
      "⚠ 名前が # で始まるので、Ghost がこのタグを内部タグにします（読者から見えなくなります）。"
    );
  }
  // **同じ名前なら押させない。** `ok: false` だけで止めると、押した人には何も起きず、
  // 「壊れている」と読める。理由を文にして、ボタンは `blocked` で止める（`ConfirmSheet`）。
  if (name === tag.name) lines.push("⚠ 名前が変わっていません。");
  return { name, lines, ok: name !== tag.name };
}

/**
 * 印を付け替えるときの確認の文。**「その他」を潰すときだけ出す。**
 *
 * `classification` は Ghost の画面に欄が無い（`ghost/admin/app` を grep しても 1 つも出ない。
 * 実測 2026-10-03）。だから `other` の値は机からも管理画面からも戻せない — 実データの
 * `AI事業` が付いたタグは、押し間違い 1 つで元に戻せなくなる。机が持つ 2 つの印
 * （媒体 ↔ 紙面）の行き来はどちらへも戻せるので、確認は要らない。
 */
export function markPlan(tag: DeskTag, want: "medium" | "face"): string[] {
  const from = tagMarkOf(tag);
  const lines = [
    `「${tag.name}」の印: ${from === "other" ? tag.classification : MARK_LABEL[from]} → ${MARK_LABEL[want]}`,
  ];
  if (from === "other") {
    lines.push(
      `⚠ いまの印「${tag.classification}」は戻せません。Ghost のタグ画面にもこの欄は無く、` +
        `机も「媒体」と「紙面」の 2 つしか送らないためです。`
    );
  }
  return lines;
}

export type NewTagDraft = {
  kind: "medium" | "face";
  /** 人が打った名前。面は素の面名（"社会"） — `#` と `面` は机が付ける。 */
  name: string;
  /** 人が打った slug の語。空なら名前から組む。 */
  typedSlug: string;
  description: string;
};

export type NewTagPlan = {
  name: string;
  slug: string;
  description: string;
  visibility: string;
  classification: string;
  /** 確認の 1 枚に出す文。 */
  lines: string[];
  /** 送れるか。名前が空なら false（画面もボタンを止める）。 */
  ok: boolean;
};

/**
 * 足すタグの体。**確認の 1 枚に出す値と、実際に送る値はこの 1 本が決める**
 * （`mediumSlugOf` と同じ理由 — 別々に組むと、見せた slug と違うタグができる）。
 */
export function newTagPlan(draft: NewTagDraft): NewTagPlan {
  const face = draft.kind === "face";
  const name = face ? faceTagNameOf(draft.name) : draft.name.trim();
  const slug = face
    ? faceSlugOf(draft.name, draft.typedSlug)
    : mediumSlugOf(draft.name, draft.typedSlug);
  const classification = face ? FACE_CLASSIFICATION : MEDIUM_CLASSIFICATION;
  const lines =
    name === ""
      ? ["⚠ 名前が要ります。"]
      : [
          `名前: ${name}`,
          `slug: ${slug}`,
          `分類: ${classification}（タグの classification 列に入ります）`,
          "可視性: internal（管理画面と机だけに出ます）",
          ...(face ? ["読者面は「#◯◯面」の名前のタグを面として見つけます（この形で作ります）。"] : []),
        ];
  return {
    name,
    slug,
    description: draft.description.trim(),
    visibility: "internal",
    classification,
    lines,
    ok: name !== "",
  };
}

// ---- 暦（紙面の日を選ぶ） -----------------------------------------------------
//
// 机の「日付」は **紙面日**（JST の `YYYY-MM-DD`）で、出所は `paperDayOf` 1 本。
// ここに置くのは「どの日を選べるか」の暦算だけ。`Date` を直に触るのはこの節に閉じる。

/** 暦の月。`month` は 1-12。 */
export type MonthRef = { year: number; month: number };

const DAY_MS = 24 * 60 * 60 * 1000;

/** "YYYY-MM-DD" → {year, month}。読めない値は null（勝手に今月へ寄せない）。 */
export function monthOf(day: string): MonthRef | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day.trim());
  if (!match) return null;
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return { year: Number(match[1]), month };
}

/** 月を動かす（年を跨ぐ。負の剰余でも 1-12 に収める）。 */
export function stepMonth(ref: MonthRef, delta: number): MonthRef {
  const total = ref.year * 12 + (ref.month - 1) + delta;
  const year = Math.floor(total / 12);
  return { year, month: (((total % 12) + 12) % 12) + 1 };
}

/** 「2026年10月」。 */
export function monthLabel(ref: MonthRef): string {
  return `${ref.year}年${ref.month}月`;
}

/** 暦の見出し（日曜始まり）。`Date.getUTCDay()` の並びと同じ。 */
export const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const;

const pad2 = (value: number): string => String(value).padStart(2, "0");

/**
 * 暦に並べる 42 日（6 週 × 7 日、日曜始まり）。前後の月の日も入れる（升目を空けない）。
 *
 * **UTC の算術で組む** — 端末の時計・夏時間に左右されない。ここで作るのは日付の並びだけで、
 * 紙面日そのものは `paperDayOf` が決める（二重に持たない）。
 */
export function monthGrid(ref: MonthRef): string[] {
  const first = Date.UTC(ref.year, ref.month - 1, 1);
  const start = first - new Date(first).getUTCDay() * DAY_MS;
  const out: string[] = [];
  for (let index = 0; index < 42; index += 1) {
    const at = new Date(start + index * DAY_MS);
    out.push(`${String(at.getUTCFullYear()).padStart(4, "0")}-${pad2(at.getUTCMonth() + 1)}-${pad2(at.getUTCDate())}`);
  }
  return out;
}

/** その日が開いている月のものか（前後の月の日を薄く出すのに使う）。 */
export function inMonth(day: string, ref: MonthRef): boolean {
  const at = monthOf(day);
  return at !== null && at.year === ref.year && at.month === ref.month;
}

/**
 * 「10/2（金）」。暦の見出しに出す。読めない値は ""。
 *
 * **曜日は UTC で数える** — `paperDayOf` が作るのは JST の日付文字列で、その曜日は
 * カレンダーの曜日そのもの（時刻を持たない）。端末の時計で読むと、時差のある端末で 1 日ずれる。
 */
export function dayLabel(day: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(day ?? "").trim());
  if (!match) return "";
  const [, year, month, date] = match;
  const at = Date.UTC(Number(year), Number(month) - 1, Number(date));
  return `${Number(month)}/${Number(date)}（${WEEKDAY_LABELS[new Date(at).getUTCDay()]}）`;
}

/**
 * 紙面日を前後に動かす（"YYYY-MM-DD" から ±delta 日）。読めない値は null（勝手に今日へ寄せない）。
 *
 * **UTC の算術で組む** — `monthGrid` と同じ理由（端末の時計・夏時間に左右されない）。
 * 組み上げた日付は**もう一度読み直して確かめる** — 暦に無い "2026-02-31" を `Date.UTC` に
 * 渡すと 3/3 へ繰り上がり、押した覚えの無い日へ飛ぶ。
 */
export function stepDay(day: string, delta: number): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(day ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const date = Number(match[3]);
  if (month < 1 || month > 12 || date < 1 || date > 31) return null;
  const at = Date.UTC(year, month - 1, date);
  const check = new Date(at);
  // 閏日・小の月の 31 日など、暦に無い日は Date.UTC が繰り上げる — 読み直して確かめる
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== date) {
    return null;
  }
  const next = new Date(at + delta * DAY_MS);
  return `${String(next.getUTCFullYear()).padStart(4, "0")}-${pad2(next.getUTCMonth() + 1)}-${pad2(next.getUTCDate())}`;
}

/** 紙面日ごとの記事数。暦の升目に出す数（紙面日の出所は `paperDayOfPost` 1 本）。 */
export function countByPaperDay(articles: DeskArticle[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const article of articles) {
    const day = paperDayOfPost(article);
    if (day === "") continue;
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  return counts;
}

// ---- 絞り込みと集計 ----------------------------------------------------------

/** ある・なし・問わない（素材・読み上げ・放送の有無の絞り込み）。 */
export type PresenceFilter = "all" | "yes" | "no";

/**
 * 記事 1 本の「読み上げ・放送の有無」。`null` = **まだ読んでいない**（`false` と混ぜない。V1）。
 * 出所は `artifactPresenceOf`（newsReadIndex）1 本で、呼ぶ側が「読みが済んでいない」を
 * `null` に写す。
 */
export type ArticlePresence = { voice: boolean; avatar: boolean } | null;

export type ArticleFilter = {
  state: ArticleState | "all";
  /** 面の label（"" = すべて）。 */
  face: string;
  /** 媒体タグの slug（"" = すべて）。 */
  medium: string;
  /** 題に含まれる語（"" = 絞らない）。 */
  word: string;
  /** 素材の有無（カードと同じ `cardOf` — 種類が text でなければ「あり」）。 */
  image: PresenceFilter;
  /** 読み上げ（音声）の有無。 */
  voice: PresenceFilter;
  /** 放送（アバター）の有無。 */
  avatar: PresenceFilter;
};

export const EMPTY_FILTER: ArticleFilter = {
  state: "all",
  face: "",
  medium: "",
  word: "",
  image: "all",
  voice: "all",
  avatar: "all",
};

/** 有無の突き合わせ。"all" は素通し。 */
const passesPresence = (value: boolean, want: PresenceFilter): boolean =>
  want === "all" || value === (want === "yes");

/**
 * 記事タブの絞り込み。**語は手元で当たる** — 机は全記事を持っているので問い合わせ直さない
 * （spec §4.2 の `title:~'…'` は NQL の部分一致の意味で、画面の見え方は同じ）。
 * 大文字小文字は区別しない（NQL の LIKE と同じ）。
 *
 * `presence` は読み上げ・放送の印（`artifactPresenceOf`）。`voice` / `avatar` を絞るときだけ
 * 要る。**`null`（まだ読んでいない）は落とす** — 「まだ」を「無し」と決めつけない（V1）。
 * 呼ぶ側は `filterArticles` を使えば、この落とし分が `waiting` として返る。
 */
export function matchesFilter(
  article: DeskArticle,
  filter: ArticleFilter,
  now: Date,
  presence: ArticlePresence = null
): boolean {
  if (filter.state !== "all" && stateOf(article, now) !== filter.state) return false;
  if (filter.face && faceOf(article)?.label !== filter.face) return false;
  if (filter.medium && !article.tags.some((tag) => tag.slug === filter.medium)) return false;
  const word = filter.word.trim().toLowerCase();
  if (word && !article.title.toLowerCase().includes(word)) return false;
  if (!passesPresence(cardOf(article).type !== "text", filter.image)) return false;
  if (filter.voice !== "all" || filter.avatar !== "all") {
    if (presence === null) return false; // まだ読んでいない — ここで「無し」とは言わない（V1）
    if (!passesPresence(presence.voice, filter.voice)) return false;
    if (!passesPresence(presence.avatar, filter.avatar)) return false;
  }
  return true;
}

/**
 * 机の一覧の共通の絞り込み。**4 つのタブはこれ 1 本を通る** — 日（`pickedDay`）も、状態・面・
 * 媒体・語・有無も、同じ順で当たる。タブごとに書くと、片方のタブだけ日を忘れる（実際に
 * そうなっていた。ユーザー指示 2026-10-08）。
 *
 * `waiting` は**「まだ読んでいないから今は出せない」記事が在る**という印。読み上げ・放送で
 * 絞ったとき、印がまだ来ていない記事を「無し」に混ぜない（V1）。呼ぶ側はこれを
 * 「読み込んでいます」の 1 文に使う。
 */
export function filterArticles(
  articles: DeskArticle[],
  filter: ArticleFilter,
  now: Date,
  pickedDay: string | null,
  presenceOf: (article: DeskArticle) => ArticlePresence
): { rows: DeskArticle[]; waiting: boolean } {
  const rows: DeskArticle[] = [];
  const byArtifacts = filter.voice !== "all" || filter.avatar !== "all";
  let waiting = false;
  for (const article of articles) {
    if (pickedDay !== null && paperDayOfPost(article) !== pickedDay) continue;
    const presence = presenceOf(article);
    if (byArtifacts && presence === null) {
      // 印がまだ来ていない記事が**他はすべて通る**なら「待ち」— 読み込み後、結果は増えうる。
      if (matchesFilter(article, { ...filter, voice: "all", avatar: "all" }, now)) waiting = true;
      continue;
    }
    if (matchesFilter(article, filter, now, presence)) rows.push(article);
  }
  return { rows, waiting };
}

// ---- 並べ替え（記事タブ） ----------------------------------------------------

export type ArticleSortKey = "published" | "created" | "updated";
export type ArticleSortDir = "desc" | "asc";
export type ArticleSort = { key: ArticleSortKey; dir: ArticleSortDir };

/** 記事タブの既定 — 更新の新しい順（spec §4.2）。 */
export const DEFAULT_ARTICLE_SORT: ArticleSort = { key: "updated", dir: "desc" };

const sortValueOf = (article: DeskArticle, key: ArticleSortKey): string | null =>
  key === "published"
    ? article.published_at
    : key === "created"
      ? article.created_at || null
      : article.updated_at || null;

/**
 * 記事を並べ替えた新しい配列を返す（元は変えない）。
 * **時刻の無い記事は向きによらず末尾**（例: 公開順で下書き）— 昇順で先頭に寄ると、
 * 公開順を選んだのに下書きばかりが並ぶ。
 */
export function sortArticles(articles: DeskArticle[], sort: ArticleSort): DeskArticle[] {
  const sign = sort.dir === "asc" ? 1 : -1;
  return [...articles].sort((a, b) => {
    const ta = timeOf(sortValueOf(a, sort.key));
    const tb = timeOf(sortValueOf(b, sort.key));
    if (ta === 0 || tb === 0) return ta === tb ? 0 : ta === 0 ? 1 : -1;
    return sign * (ta - tb);
  });
}

export type StateCounts = Record<ArticleState, number> & { total: number };

/** 記事数の内訳。机の数字は**実数だけ**（取れなければ数を出さず理由を出す）。 */
export function countByState(articles: DeskArticle[], now: Date): StateCounts {
  const counts: StateCounts = {
    published: 0,
    scheduled: 0,
    overdue: 0,
    draft: 0,
    total: articles.length,
  };
  for (const article of articles) counts[stateOf(article, now)] += 1;
  return counts;
}

// ---- 有料・無料（読者への出し方） --------------------------------------------

/**
 * 読者への出し方。**Ghost の `posts.visibility` の 4 値**（`public` / `members` / `paid` /
 * `tiers`）を、机が数える 3 つ + 知らない値に写す。
 *
 * `tiers`（プラン指定）は有料の側に数える — 机が知りたいのは「有料か無料か」で、どのプランかは
 * Ghost の画面で見る話。⚠️ 無料のプランだけを指定した `tiers` も**有料に数えてしまう**が、
 * それはタグとプランの組み合わせを机が読まないと分からない（分かったら分けたい）。
 * `""`（値が来ない）を無料と決めつけない — `other` に落として「区分不明」と出す。
 */
export type Access = "public" | "members" | "paid" | "other";

export const ACCESS_LABEL: Record<Access, string> = {
  public: "無料",
  members: "会員",
  paid: "有料",
  other: "区分不明",
};

export function accessOf(article: Pick<DeskArticle, "visibility">): Access {
  const value = String(article.visibility ?? "").trim().toLowerCase();
  if (value === "public") return "public";
  if (value === "members") return "members";
  if (value === "paid" || value === "tiers") return "paid";
  return "other";
}

export type AccessCounts = Record<Access, number> & { total: number };

/** 有料・無料の内訳。机の数字は**実数だけ**（取れなければ数を出さず理由を出す）。 */
export function countByAccess(articles: DeskArticle[]): AccessCounts {
  const counts: AccessCounts = { public: 0, members: 0, paid: 0, other: 0, total: articles.length };
  for (const article of articles) counts[accessOf(article)] += 1;
  return counts;
}

// ---- タブ --------------------------------------------------------------------

/**
 * 机のタブ。順番が画面の順番（spec §4.0・A5③）。
 *
 * 読み上げとアバターは**1 つのタブに統合した**（ユーザー指示 2026-10-07。2026-10-03 の
 * 「別のタブ」指示を置き換えた）。どちらも project に紐づくジョブで、記事そのものでは
 * なく**作った成果物**を見る面。`mediums` の id は変えない（`?tab=mediums` の既存リンクを
 * 切らないため）が、中身は媒体と紙面の両方になった。
 */
// ---- 読み上げ・放送のカードの絞り込み ------------------------------------------

/** 読み上げ・放送タブのタブ内の絞り込み（記事タブと同じ並び + 作者）。 */
export type CardFilter = {
  /** 紙面日（null = すべて）。 */
  day: string | null;
  state: ArticleState | "all";
  /** 面の label（"" = すべて）。 */
  face: string;
  /** 媒体タグの slug（"" = すべて）。 */
  medium: string;
  /** 書き手の名前（"" = すべて）。 */
  author: string;
  /** 題・本文に含まれる語。 */
  word: string;
};

export const EMPTY_CARD_FILTER: CardFilter = { day: null, state: "all", face: "", medium: "", author: "", word: "" };

export const isCardFilterActive = (f: CardFilter): boolean =>
  f.day !== null || f.state !== "all" || f.face !== "" || f.medium !== "" || f.author !== "" || f.word.trim() !== "";

/** 1 本が絞り込みに合うか。語は題と本文（plaintext）を見る。大文字小文字は区別しない。 */
export function matchesCardFilter(article: DeskArticle, f: CardFilter, now: Date): boolean {
  if (f.day !== null && paperDayOfPost(article) !== f.day) return false;
  if (f.state !== "all" && stateOf(article, now) !== f.state) return false;
  if (f.face !== "" && (faceOf(article)?.label ?? "") !== f.face) return false;
  if (f.medium !== "" && !article.tags.some((tag) => tag.slug === f.medium)) return false;
  if (f.author !== "" && !(article.authorNames ?? []).includes(f.author)) return false;
  const word = f.word.trim().toLowerCase();
  if (word && !article.title.toLowerCase().includes(word) && !article.plaintext.toLowerCase().includes(word)) return false;
  return true;
}

/** 作者の選択肢（並べた記事に出てくる名前だけ。重ねない・名前順）。 */
export function authorChoicesOf(articles: Pick<DeskArticle, "authorNames">[]): string[] {
  const names = new Set<string>();
  for (const article of articles) for (const name of article.authorNames ?? []) names.add(name);
  return [...names].sort((a, b) => a.localeCompare(b, "ja"));
}

export const DESK_TABS = [
  { id: "paper", label: "電子紙面" },
  { id: "articles", label: "記事" },
  { id: "assets", label: "素材" },
  // 読み上げとアバター放送は別のタブ（ユーザー指示 2026-10-14。2026-10-07 の統合を分け直した）。
  // `broadcast` の id は変えない（`?tab=broadcast` の既存リンクを切らない）。
  { id: "read", label: "音声読み上げ" },
  { id: "broadcast", label: "バーチャル放送", emphasis: true },
  { id: "mediums", label: "媒体と紙面" },
] as const;

export type DeskTabId = (typeof DESK_TABS)[number]["id"];

/** `?tab=` の値を読む。知らない値・空は null（呼ぶ側が既定に落とす）。 */
export function tabFromSearch(search: string, ids: string[]): string | null {
  const wanted = new URLSearchParams(search).get("tab") ?? "";
  return ids.includes(wanted) ? wanted : null;
}
