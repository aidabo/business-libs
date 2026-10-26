// news-read成果物と明示採用されたbroadcast renditionを記事へ結び付ける純関数。
//
// ── どこから来るか ─────────────────────────────────────────────────
// news の仕事の行（`social_ai_news_jobs`）から。1 本の仕事は、記事の一覧と
// 公開済みの成果物を同じ行に持っている:
//
//   items[]     { key: <slug>, post_id: <記事 id>, status }
//   artifacts[] { kind: 'voice'|'video', name: '<slug>.m4a' / '<slug>-photo-avatar.mp4', storageUrl: <公開 URL> }
//
// 突き合わせは **成果物の名前**（`jb-x.m4a` → `jb-x`）と記事の slug。机の印
// （`./newsReadIndex.ts`）と**同じ規則**で、`stemOf` も
// そちらが持つ。**同じ規則を 2 か所に置かない** — 片方だけ直すと、机に
// 「音声あり」と出ている記事に読者面のボタンが付かない（逆も同じ）。
//
// ── なぜ manifest.json を読まないか（2026-09-30 に替えた）─────────
// 前の版は配信元の manifest.json を `NEWS_AUDIO_MANIFEST_URL` で読んでいた。
// manifest は**この仕事の成果物を合成したもの**なので、仕事の行を見れば同じ物が
// 手に入る。設定が 1 つ減り、記事の id も要らなくなる（manifest の行には古い
// ものだと id が無く、slug で引き直す必要があった＝実測で 9 行中 4 行）。
// 行の artifacts[] と `social_media_assets` は同じ 1 回の公開から来る
// （runner が公開 → link-assets → 完了 の順に呼ぶ）ので、どちらを見ても同じ。
//
// ── なぜサーバーで取るか ──────────────────────────────────────────
// 仕事の一覧は admin の口で、鍵かセッションが要る。ブラウザには出せないので、
// 面のサーバー側で 1 回引いて、画面へは URL の並びだけを渡す。音声そのものは
// <audio> が cross-origin でも鳴る（メディアは CORS を要求しない）。
//
// ── API について ───────────────────────────────────────────────────
// 音声・従来avatarはnews job一覧から読む。明示採用版は
// `social/ai/news/broadcast-selections` endpointからPost IDで解決する。
// どちらもサーバー側で取得し、既存の公開記事確認後に画面へ渡す。

import { stemOf, type ReadJob } from "./newsReadIndex";
import { isBroadcastArtifact, resolveBroadcastArtifact, type NewsBroadcastSelection } from "./newsBroadcast";
import type { NewsPost as Post } from "./post";
import { artifactUrl } from "./artifactUrl";

/** 1 本の記事に付く成果物。同じ記事に声と映像の両方がありうる。 */
export type NewsAudioTrack = {
  /** 読み上げ音声（.m4a）の URL。無ければ null。 */
  voice: string | null;
  /** 読み上げ映像（.mp4）の URL。無ければ null。 */
  video: string | null;
  /** Self-hosted presenter broadcast URL. */
  avatar?: string | null;
};

/**
 * 仕事の行から取り出した 1 行。サーバーから画面へ渡すので、
 * そのまま送れる平たい形にしてある（Map や Date を混ぜない）。
 */
export type NewsAudioEntry = {
  kind: "voice" | "video";
  /** 再生できる絶対 URL。組み立て済み。 */
  url: string;
  /** 記事の id。仕事の items[] が持っていれば入る。 */
  postId: string | null;
  /** 記事の slug（成果物の名前から落としたもの）。id が無い行のために持つ。 */
  slug: string | null;
  avatar?: boolean;
};

export type { NewsBroadcastSelection } from "./newsBroadcast";

export type NewsAudioIndex = {
  byPostId: Map<string, NewsAudioTrack>;
  bySlug: Map<string, NewsAudioTrack>;
};

export const EMPTY_AUDIO_INDEX: NewsAudioIndex = { byPostId: new Map(), bySlug: new Map() };

/** 鳴っている 1 本。帯（AudioBar）と記事カードが同じものを見る。 */
export type NowPlaying = { id: string; title: string; url: string };

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * 成果物の URL を受ける。**http(s) の絶対 URL だけ**。それ以外は null。
 *
 * `<audio src>` に入る文字列なので、素通しはしない。`data:` や `javascript:` は
 * 鳴らす以外のことをする値を読ませる道になり、プロトコル相対（`//host`）は
 * 別の配信元へ飛ばす道になる。**規則は `artifactUrl` の 1 か所**（机・NewsAgent の
 * パネル・job の詳細画面と同じ許可表 — 面ごとに書くと片方だけ緩む）。
 *
 * 相対の `file` を配信元で解決していた manifest 版と違い、行の `storageUrl` は
 * worker が組み立て済みの絶対 URL（`NEWS_JOB_GALLERY_ASSET_HOST` + 鍵）。
 * 組み立ての材料が無ければ null で公開されないので、ここへ相対が来ることは無い。
 *
 * **配信元までは絞れない。** manifest 版は「配信元の外へ出る `file` は落とす」が
 * 出来た（相対を既知の配信元で解決していたので、絶対 URL は抜け道だった）。
 * いまは読者面に配信元の設定が無く、比べる相手が無い。絞れるのは scheme まで —
 * ここを通るのは「音を取ってくる」以外の意味を持ちうる値だけは落とす、という線。
 */
export function mediaUrl(value: unknown): string | null {
  // 文字列でない値は受けない（`text`）— 公開前の行が数値や物を置いていても
  // `<audio src>` に化けない。scheme の判断は artifactUrl が持つ。
  const url = text(value);
  if (url === null) return null;
  return artifactUrl(url);
}

/**
 * news の仕事の行（`social_ai_news_jobs`）を、画面へ渡せる行の並びにする。
 *
 * 仕事 1 本は記事を何本も運ぶ。`items[]` の `key`（＝記事の slug）と、成果物の
 * 名前（`jb-x.m4a` → `jb-x`）を突き合わせて、記事ごとの URL を拾う。`post_id` は
 * 同じ `items[]` の 1 件から取る — 成果物の側は id を持たない（名前だけ）。
 *
 * voice と通常videoはそれぞれ新しい物を残す。同じPostのavatar renditionは
 * 明示selectionがあればそれだけを使い、無ければlegacy `-avatar.mp4` にfallbackする。
 * photo/lipsync候補はselectionを通らない限り公開配列へ入れない。
 *
 * 開けない成果物（`storageUrl` が無い）は載せない。画面から辿れないだけでなく、
 * 公開まで行っていないことが多い（机の印と同じ判断）。
 */
export function audioEntriesFromJobs(
  jobs: ReadJob[] | null | undefined,
  selections: NewsBroadcastSelection[] = [],
): NewsAudioEntry[] {
  const out: NewsAudioEntry[] = [];
  const seen = new Set<string>();
  if (!Array.isArray(jobs)) return out;

  for (const job of jobs) {
    if (!isObject(job)) continue;
    const items = Array.isArray(job.items) ? job.items : [];
    const artifacts = Array.isArray(job.artifacts) ? job.artifacts : [];
    if (items.length === 0 || artifacts.length === 0) continue;

    for (const item of items) {
      if (!isObject(item)) continue;
      const slug = text(item.key);
      if (slug === null) continue;
      const postId = text(item.post_id);
      const broadcast = resolveBroadcastArtifact(slug, postId, artifacts, selections);

      for (const artifact of artifacts) {
        if (!isObject(artifact)) continue;
        const adoption = String(artifact.metadata?.adoption ?? "").trim().toLowerCase();
        if (adoption === "draft") continue;
        const kind = String(artifact.kind ?? "").trim().toLowerCase();
        if (kind !== "voice" && kind !== "video") continue;
        const artifactStem = stemOf(String(artifact.name ?? ""));
        const isAvatar: boolean = kind === "video" && isBroadcastArtifact(slug, artifact);
        const artifactSlug: string = isAvatar ? artifactStem.replace(/-photo-avatar$/, "").replace(/-avatar$/, "") : artifactStem;
        if (artifactSlug !== slug) continue;

        // Every avatar variant is resolved below by the shared selection/fallback resolver.
        if (isAvatar) continue;

        const url = mediaUrl(artifact.storageUrl);
        if (url === null) continue;

        const mark = `${slug}\n${kind}\n${isAvatar ? "avatar" : "primary"}`;
        if (seen.has(mark)) continue;
        seen.add(mark);
        out.push({ kind, url, postId, slug, ...(isAvatar ? {avatar: true} : {}) });
      }

      const broadcastUrl = mediaUrl(broadcast?.storageUrl);
      if (broadcastUrl !== null) {
        const mark = `${slug}\nvideo\navatar`;
        if (!seen.has(mark)) {
          seen.add(mark);
          out.push({kind: "video", url: broadcastUrl, postId, slug, avatar: true});
        }
      }
    }
  }
  return out;
}

// ── 公開の確認（2026-09-30）────────────────────────────────────────
//
// 仕事の一覧は「news の仕事」を全部返す。記事が後から下書きに戻った日でも、
// 成果物は行に残る。そのまま画面へ渡すと、読者が開けない記事の音声 URL が
// HTML に載る — 画面に出さなくても、HTML を読めば見えるので隠したことにならない。
//
// だから載せる前に、**その記事が公開かどうか**をサーバー側で確かめる。確かめる
// 相手は面の記事と同じ口（`POST /api/posts`）で、あの口は呼び出し側が何を渡しても
// `visibility:public` と `status:[published,sent]` を必ず足す。規則はここへ写さない。

/** 公開の確認を 1 回で聞く識別子の数。filter は URL に載るので、長すぎると弾かれる。 */
export const PUBLISHED_CHECK_CHUNK = 60;

/** Ghost の記事 id。24 桁の 16 進。 */
const GHOST_ID = /^[0-9a-f]{24}$/i;

/** 記事の slug。worker と Ghost が同じ形にする（英数と `._-`）。 */
const ARTICLE_SLUG = /^[A-Za-z0-9._-]+$/;

/** 確認の口が返す記事の、こちらが読むぶん。 */
export type PublishedPost = { id?: unknown; slug?: unknown };

/**
 * 確かめる相手（記事の識別子）を取り出す。id と slug の両方を集める。
 *
 * **形の合わない値は捨てる。** この文字列はそのまま Ghost の filter に組み立てて
 * 入る。`,` や `]` が混ざると確認の問い合わせ自体を組み替えられ、確認を素通り
 * させる道になる。仕事の行は外から来た値なので、通す前に形を見る。
 *
 * 片方だけでも残れば確認できる（id が無い古い行は slug で引く）。
 */
export function articleKeysOf(entries: NewsAudioEntry[]): { ids: string[]; slugs: string[] } {
  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const entry of entries) {
    const id = text(entry.postId);
    if (id !== null && GHOST_ID.test(id)) ids.add(id);
    const slug = text(entry.slug);
    if (slug !== null && ARTICLE_SLUG.test(slug)) slugs.add(slug);
  }
  return { ids: [...ids], slugs: [...slugs] };
}

/**
 * 公開を確かめる問い合わせ文。`(id:[…],slug:[…])` の形。相手が居なければ `""`。
 *
 * ── なぜ括るか ────────────────────────────────────────────────────
 * `POST /api/posts` は渡された filter の前に `visibility:public+` を、後ろに
 * `+status:[published,sent]` を足す。Ghost の filter は `,` が「または」、`+` が
 * 「かつ」で、**`+` の方が強く結ぶ**。括らないと後から足される 2 つが slug の枝に
 * しか掛からず、id で当たった記事が公開の条件を素通りする。括りが効き目そのもの。
 */
export function publishedCheckFilter(keys: { ids: string[]; slugs: string[] }): string {
  const parts: string[] = [];
  if (keys.ids.length > 0) parts.push(`id:[${keys.ids.join(",")}]`);
  if (keys.slugs.length > 0) parts.push(`slug:[${keys.slugs.join(",")}]`);
  return parts.length === 0 ? "" : `(${parts.join(",")})`;
}

/**
 * 読み上げの一覧から、**公開されていない記事の行を落とす**。
 *
 * `published` は確認の口が返した記事の並び。あの口が必ず公開の条件を足すので、
 * ここに来た記事は公開記事だけ。規則はここへ写さない — 写すと、あちらが変わった
 * 日にこちらだけ古い規則で「公開」と言うことになる。
 *
 * 確かめられなかった行（id も slug も返ってこない）は落とす。**落とす向きに倒す** —
 * 公開かどうか分からない物を公開面の HTML に載せないため。音声が出ない日は
 * あっても、記事は今までどおり読める。
 */
export function keepPublishedEntries(
  entries: NewsAudioEntry[],
  published: ReadonlyArray<PublishedPost>,
): NewsAudioEntry[] {
  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const post of published) {
    const id = text(post?.id);
    if (id !== null) ids.add(id);
    const slug = text(post?.slug);
    if (slug !== null) slugs.add(slug);
  }

  return entries.filter((entry) => {
    const id = text(entry.postId);
    if (id !== null && ids.has(id)) return true;
    const slug = text(entry.slug);
    return slug !== null && slugs.has(slug);
  });
}

/** 空白だけの文字列は「無い」と同じに扱う。 */
function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/** 行の並びから、記事 id / slug → 成果物 の索引を作る。 */
export function indexAudioEntries(entries: NewsAudioEntry[]): NewsAudioIndex {
  const byPostId = new Map<string, NewsAudioTrack>();
  const bySlug = new Map<string, NewsAudioTrack>();

  const put = (map: Map<string, NewsAudioTrack>, key: string, kind: "voice" | "video", url: string) => {
    const current = map.get(key) ?? { voice: null, video: null };
    map.set(key, kind === "voice" ? { ...current, voice: url } : { ...current, video: url });
  };

  for (const entry of entries) {
    if (entry.postId !== null) {
      put(byPostId, entry.postId, entry.kind, entry.url);
      if (entry.avatar) {
        const current = byPostId.get(entry.postId) ?? { voice: null, video: null };
        byPostId.set(entry.postId, { ...current, avatar: entry.url });
      }
    }
    if (entry.slug !== null) {
      put(bySlug, entry.slug, entry.kind, entry.url);
      if (entry.avatar) {
        const current = bySlug.get(entry.slug) ?? { voice: null, video: null };
        bySlug.set(entry.slug, { ...current, avatar: entry.url });
      }
    }
  }
  return { byPostId, bySlug };
}

/**
 * 記事に付いている成果物。id を先に見て、無ければ slug で引く。
 *
 * id を先にするのは、slug が後から変わりうるため（id は変わらない）。
 */
export function trackOf(index: NewsAudioIndex, post: Pick<Post, "id" | "slug">): NewsAudioTrack | null {
  const id = text(post.id);
  if (id !== null) {
    const hit = index.byPostId.get(id);
    if (hit) return hit;
  }
  const slug = text(post.slug);
  if (slug !== null) {
    const hit = index.bySlug.get(slug);
    if (hit) return hit;
  }
  return null;
}

/** 読み上げのある記事だけを、渡された順のまま抜き出す。 */
export function listenPosts(posts: Post[], index: NewsAudioIndex): Post[] {
  return posts.filter((post) => trackOf(index, post)?.voice != null);
}

/** 「2:31」の形。1 時間を超えるものは「1:02:31」。 */
export function mmss(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const s = total % 60;
  const m = Math.floor(total / 60) % 60;
  const h = Math.floor(total / 3600);
  const two = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${two(m)}:${two(s)}` : `${m}:${two(s)}`;
}
