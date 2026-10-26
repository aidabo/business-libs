// 取得した記事リストを、第一面・速報・面立てに振り分ける純関数。
//
// DOM も fetch も知らない。ここに描画（React 要素）を混ぜると、この層を
// DOM 無しで試せなくなる。このリポジトリの vitest は jsdom も使えるが
// （`// @vitest-environment jsdom` を書く試験がある）、この層は environment: "node" の
// まま置いておく方が速く、壊れにくい。
//
// 振り分けの規則（spec §4.1）:
//   第一面 = featured の記事を新しい順に 6 本（主役 1・準主役 2・短信 3）
//   速報   = その日の記事を published_at の降順で 5 本。第一面に出たものは除く
//   面立て = 面 × 4 本。第一面と速報に出たものは除く
// 同じ slug を 2 回出さないこと（spec §4.2・§11-2）は、除外 id を繰り越して担保する。

import type { NewsPost as Post } from "./post";
import { faceLabelOfTag, faceOrderOf, type Face } from "./faces";
import { PAPER_TIMEZONE } from "./edition";

const byNewest = (a: Post, b: Post) =>
  new Date(b.published_at).getTime() - new Date(a.published_at).getTime();

/**
 * 記事から面の一覧を組み立てる。面は Ghost の内部タグ（`#経済面`）から発見する。
 *
 * 既知の面は faces.ts の表の順、知らない面はその後ろに名前順で並ぶ。
 * 記事が 1 本も無い面は現れない（空の見出しを並べない）。
 */
/** 面タグを持てるもの（読者面の Post と、机の DeskArticle の両方）。 */
type TagBearing = { tags?: Array<{ name?: unknown; slug?: unknown }> };

export function buildFaces<T extends TagBearing>(posts: T[]): Face[] {
  const found = new Map<string, Face>();

  for (const post of posts) {
    for (const tag of post.tags ?? []) {
      const label = faceLabelOfTag(tag);
      if (label === null || found.has(label)) continue;
      found.set(label, {
        slug: String(tag.slug ?? ""),
        label,
        order: faceOrderOf(label),
      });
    }
  }

  return [...found.values()].sort(
    (a, b) => a.order - b.order || a.label.localeCompare(b.label, "ja"),
  );
}

/**
 * 記事の面。面タグが複数あるときは、面の並びで先のもの。無ければ null。
 *
 * 面の一覧を引数に取らないのは、この規則が記事 1 本で閉じるため（既知の面は
 * faces.ts の表、知らない面は名前順）。並びの規則を buildFaces と同じにしてあるので、
 * 面立ての並びと、ここで決まる面が食い違うことはない。
 */
export function faceOf<T extends TagBearing>(post: T): Face | null {
  let best: Face | null = null;

  for (const tag of post.tags ?? []) {
    const label = faceLabelOfTag(tag);
    if (label === null) continue;
    const order = faceOrderOf(label);
    if (
      best === null ||
      order < best.order ||
      (order === best.order && label.localeCompare(best.label, "ja") < 0)
    ) {
      best = { slug: String(tag.slug ?? ""), label, order };
    }
  }

  return best;
}

/**
 * 画像・映像として読み込んでよい URL だけを通す。それ以外は null。
 *
 * 通すのは http / https と、このサイト自身を指す相対（`/path`、`//host/path`）だけ。
 * 許可リストにしてあるのは、危険な scheme を数え上げる方式だと必ず漏れるため
 * （javascript: / data: / vbscript: / blob: …）。挙げなかった物は全部落ちる。
 *
 * なぜ要るか: この URL は記事の本文から正規表現で拾った物でもありうる
 * （postTransform → extractMediaFromHtml が <video>/<source> の src と
 * data-kg-thumbnail をそのまま取る）。React 18 は img/video の src や poster を
 * 無害化しない（実測: javascript:alert(1) が素で通る）。img の src は
 * script の実行口ではないので今すぐ危ないわけではないが、拾った値をそのまま
 * タグへ流す形は残さない。読み込みに失敗しても枠が出ないだけで済む。
 */
export function safeMediaUrl(value: string | null | undefined): string | null {
  const url = (value ?? "").trim();
  if (!url) return null;
  if (url.startsWith("/")) return url;
  return /^https?:/i.test(url) ? url : null;
}

/**
 * 一覧・第一面に出す「1 枚」。feature_image ではなく displayUrl を先に見る。
 *
 * 動画の記事は feature_image を持たない（本文に映像、見出しの絵は映像のサムネ）。
 * その理由は postTransform にある — getMediaInfo は feature_image があると
 * それを見て即返るので、絵を残すと `src` が映像でなくなり、読者面は動画だと
 * 分からなくなる。だから動画の記事は feature_image を外し、サムネイルは
 * displayUrl（getDisplayUrl が video のとき thumbnailUrl を返す）から取る。
 *
 * 画像の記事では displayUrl は feature_image と同じ物を指す（getDisplayUrl は
 * mediaInfo.url を返し、それは feature_image）。つまり並びは変わらない。
 * 記事が本当に絵を持たないときだけ null になり、呼ぶ側は枠ごと出さない（spec §4.2）。
 *
 * どちらの値も safeMediaUrl を通す。落ちたときは次の候補へ渡り、両方落ちれば
 * null（＝枠を出さない）— 危険な URL を消すために絵まで消す必要はない。
 */
export function thumbOf(post: Post): string | null {
  return safeMediaUrl(post.displayUrl) ?? safeMediaUrl(post.feature_image) ?? null;
}

export type Subtopic = {
  /** 読者に見せる語。公開タグの表示名。 */
  name: string;
  slug: string;
  /** その面で、この語が付いている記事の数。 */
  count: number;
};

/**
 * 面の中分類。その面の記事に付いている公開タグを、記事数の多い順に返す。
 *
 * 内部タグは落とす（読者の語彙ではない）。面名と同じ語も落とす（「スポーツ面」の
 * 下に「スポーツ」を並べても分類にならない）。1 本だけの語は既定で落とす —
 * その面の分類ではなく、その記事だけの語なので。
 */
export function subtopicsOfFace(posts: Post[], face: Face, min = 2): Subtopic[] {
  const counts = new Map<string, Subtopic>();

  for (const post of posts) {
    if (faceOf(post)?.label !== face.label) continue;
    for (const tag of post.tags ?? []) {
      const name = String(tag.name ?? "").trim();
      if (!name || name.startsWith("#") || name === face.label) continue;
      const seen = counts.get(name);
      if (seen) {
        seen.count += 1;
        continue;
      }
      counts.set(name, { name, slug: String(tag.slug ?? ""), count: 1 });
    }
  }

  return [...counts.values()]
    .filter((topic) => topic.count >= min)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ja"));
}

/**
 * 公開後に手が入ったか。編集局の差し替えを読者面でも示すための印。
 *
 * 時刻ではなく紙面の日（JST）で比べる。Ghost は保存のたびに updated_at を
 * サーバー側で打ち直すので、時刻で比べると面の割り付けのような事務的な
 * 保存でも「更新」が点く（実際に 65 本すべてへ面タグを付けた時点で、全部が
 * 更新になった）。同じ版のうちの手直しは読者には差し替えではない。
 */
export function isUpdated(post: Post): boolean {
  return paperDayOf(post.updated_at) > paperDayOf(post.published_at);
}

/**
 * 紙面の日（JST）を "2026-09-26" の形で返す。文字列比較がそのまま日の比較になる。
 *
 * **記事の日付を出す所・日でまとめる所は全部これを通す。** 素の日付を出すと
 * 時差で 1 日ずれる（ローカルの時刻で切ると、JST の朝刊が前日になる）。
 * 読者面の「更新」印（isUpdated）も編集局の一覧も同じ物差しを使う。
 */
export function paperDayOf(value: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: PAPER_TIMEZONE,
  }).format(new Date(value));
}

/**
 * 公開日。「9月26日」の形（年は出さない — 読者面の 1 行に収める。ArticleCell の
 * stamp と同じ綴り）。
 *
 * 日の切り出しは paperDayOf を通す。素の getDate は環境の時計任せで、JST の
 * 朝刊が前日になる — この節の印（isUpdated）と同じ理由。
 * 読めない値は空文字を返し、呼ぶ側（放送のカード）は日付ごと出さない。
 */
export function publishedDateLabel(post: Post): string {
  if (Number.isNaN(new Date(post.published_at).getTime())) return "";
  const [, month, day] = paperDayOf(post.published_at).split("-");
  return `${Number(month)}月${Number(day)}日`;
}

export type FrontPage = {
  /** 主役。記事が 1 本も無ければ null。 */
  lead: Post | null;
  /** 準主役。最大 2 本。 */
  sub: Post[];
  /** 短信。最大 3 本。 */
  briefs: Post[];
};

/**
 * 第一面。featured が付いた記事を新しい順に取り、主役 1・準主役 2・短信 3 に割る。
 * featured が足りなければ、公開の新しい順で埋める。足りない枠は作らない。
 */
export function selectFrontPage(posts: Post[]): FrontPage {
  const ordered = [...posts].sort(byNewest);
  const featured = ordered.filter((post) => post.featured);
  const rest = ordered.filter((post) => !post.featured);
  const picked = [...featured, ...rest].slice(0, 6);

  const [lead = null, ...others] = picked;
  return {
    lead,
    sub: others.slice(0, 2),
    briefs: others.slice(2, 5),
  };
}

/** 第一面に出た記事の id。 */
export function frontPageIds(front: FrontPage): string[] {
  return [front.lead, ...front.sub, ...front.briefs]
    .filter((post): post is Post => post !== null)
    .map((post) => post.id);
}

export type FlashItem = {
  post: Post;
  /** 公開後に更新されているか。 */
  updated: boolean;
};

/** 速報。除外 id を除いた中から、公開の新しい順に limit 本。 */
export function selectFlash(posts: Post[], excludeIds: string[], limit = 5): FlashItem[] {
  const skip = new Set(excludeIds);
  return [...posts]
    .filter((post) => !skip.has(post.id))
    .sort(byNewest)
    .slice(0, limit)
    .map((post) => ({ post, updated: isUpdated(post) }));
}

/** 速報に出た記事の id。 */
export function flashIds(flash: FlashItem[]): string[] {
  return flash.map((item) => item.post.id);
}

/**
 * 面立て。面ごとに perFace 本。
 * 1 本も無い面は面ごと落とす（空の見出しを並べない）。
 * 同じ記事が 2 つの面タグを持っていても、先に出た面にだけ置く。
 */
export function selectFaceLines(
  posts: Post[],
  faces: Face[],
  excludeIds: string[],
  perFace = 4,
): { face: Face; posts: Post[] }[] {
  const skip = new Set(excludeIds);
  const ordered = [...posts].sort(byNewest);
  const lines: { face: Face; posts: Post[] }[] = [];

  for (const face of faces) {
    const picked: Post[] = [];
    for (const post of ordered) {
      if (picked.length >= perFace) break;
      if (skip.has(post.id)) continue;
      if (faceOf(post)?.label !== face.label) continue;
      picked.push(post);
      skip.add(post.id);
    }
    if (picked.length > 0) lines.push({ face, posts: picked });
  }

  return lines;
}

/** 紙面（/home/news）の読み上げ・放送の帯に出す本数。続きは一覧面（/home/news/listen・/broadcast）。 */
export const BAND_LIMIT = 10;

/**
 * 公開の新しい順（読み上げ・放送の帯と一覧面の並び）。取ってくる口は `featured desc,
 * published_at desc` の順で来るので、主役が先に混ざる — 帯は主役かどうかでなく新しさで並べる。
 *
 * **時刻として比べる**（`Date.parse`）。文字列の比較だと `Z` と `+09:00` が混ざったときに
 * 並びが狂う。公開日が無い・読めない記事は後ろ。同じ時刻どうしは元の順のまま（sort は安定）。
 * 元の配列は変えない。
 */
export function newestFirst<T extends { published_at?: string | null }>(posts: T[]): T[] {
  const timeOf = (post: T): number => {
    const time = Date.parse(post.published_at ?? "");
    return Number.isFinite(time) ? time : Number.NEGATIVE_INFINITY;
  };
  return [...posts].sort((a, b) => {
    const ta = timeOf(a);
    const tb = timeOf(b);
    if (ta === tb) return 0;
    return tb > ta ? 1 : -1;
  });
}

