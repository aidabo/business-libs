// 読み上げ済みの記事を、机の記事一覧で見分けるための索引。
//
// ── なぜジョブ一覧から作るか ────────────────────────────────────────
// 音声を置くのは news-read ジョブだけ（tools/news-worker/scripts/janabiz-news-voice.mjs は手元の
// 下見用で、何も公開しない）。だから news の job 一覧が、そのまま「作った物の
// 全部」になる。読者面も同じ一覧を見る（newsAudio.ts の audioEntriesFromJobs）
// ので、机と読者面は同じ 1 つの事実を別の角度から見ていることになる。
//
// 突き合わせは**成果物の名前**（`jb-x.m4a` → `jb-x`）と記事の slug。机の
// 「最近のジョブ」が既に使っている規則と同じで、ここを変えると片方だけが
// 合わなくなる（記事の行に音声が付かなくなる）。

import { artifactUrl } from "./artifactUrl";
import { resolveBroadcastArtifact, type NewsBroadcastSelection } from "./newsBroadcast";

/** job 行の items[] 1 件。記事 1 本ぶんの仕事。`key` は記事の slug。 */
export type ReadJobItem = {
  key?: string | null;
  /** Ghost の記事 id。机の印は使わないが、読者面が記事と結ぶのに要る。 */
  post_id?: string | null;
  status?: string | null;
};

/** job 行の artifacts[] 1 件。`name` は `jb-x.m4a` / `jb-x.mp4`。 */
export type ReadJobArtifact = {
  kind?: string | null;
  name?: string | null;
  storageUrl?: string | null;
  /** worker が置く印。アバターの映像だけ `{ asset_kind: "avatar" }` が入る。 */
  metadata?: { asset_kind?: unknown; presentation?: unknown; avatar_mode?: unknown; adoption?: unknown } | null;
};

/** 索引が読むぶんだけの job 行。 */
export type ReadJob = {
  project_id?: string | null;
  items?: ReadJobItem[] | null;
  artifacts?: ReadJobArtifact[] | null;
};

/**
 * 記事 1 本の印。
 *
 * `voice` / `video` は**開ける成果物が在る**こと。`running` は**いま作っている**
 * ことで、まだ在るとは言えない（別々に持つのは、一覧で「音声あり」と「作成中」を
 * 出し分けるため）。
 */
export type ReadMark = {
  voice: boolean;
  video: boolean;
  running: boolean;
};

export type ReadIndex = Map<string, ReadMark>;

/** 成果物の名前から拡張子を落とす（`jb-x.m4a` → `jb-x`）。 */
export function stemOf(name: string): string {
  return String(name ?? "").replace(/\.[A-Za-z0-9]+$/, "");
}

/**
 * **アバターの映像かどうか。** news-read は同じ記事から 2 種類の映像を作る —
 * 記事そのものの映像（`jb-x.mp4`）と、アバターに読ませた映像（`jb-x-avatar.mp4`／
 * `jb-x-photo-avatar.mp4`、`metadata.asset_kind === "avatar"|"avatar-slideshow"`。
 * tools/news-worker/src/steps/news-read.js）。
 *
 * 見分けは `name` の接尾（`-avatar`）と `metadata.asset_kind` の**どちらか**が立てば
 * アバター。片方だけを見ると、古い job（metadata が無い）か新しい job（名の付け方が
 * 変わった）のどちらかで取り違える。**`stemOf` は変えない** — 読者面の ▶
 * （`newsAudio.ts`）と机の印が同じ関数を使っており、ここで `-avatar` を落とすと
 * 別の記事の成果物になる。
 *
 * **ここは読者面より 1 つ広い。** 読者面は名だけで見分けている
 * （`news/src/core/newsAudio.ts:135` の `endsWith("-avatar")`）。だから metadata にしか
 * 印が無い成果物は、机ではその記事のアバターとして出るが、読者面では別の物として
 * 扱われる。名の形が唯一の取り決めなので、**揃えたいときは worker の名の付け方
 * （`tools/news-worker/src/steps/news-read.js`）を先に直す** — 読者面の判定は
 * 公開中の記事に既に効いているので、後から緩めるのはそちらの順序になる。
 */
export function isAvatarArtifact(artifact: ReadJobArtifact | null | undefined): boolean {
  if (!artifact || typeof artifact !== "object") return false;
  const kind = String(artifact.kind ?? "").toLowerCase();
  if (kind !== "video") return false;
  const assetKind = String(artifact.metadata?.asset_kind ?? "").toLowerCase();
  if (assetKind === "avatar" || assetKind === "avatar-slideshow") return true;
  return /-(?:photo-)?avatar$/.test(stemOf(String(artifact.name ?? "")));
}

/**
 * 成果物が**どの記事のものか**。アバターの映像は `<slug>-avatar.mp4` または
 * `<slug>-photo-avatar.mp4` なので、variant suffixを落として記事のslugに戻す。
 *
 * **`indexReadArticles` はこれを使わない。** あちらは「記事の ▶ を立てるか」の判定で、
 * アバターは音声でも記事の映像でもないため、別物として扱うのが正しい（読者面の
 * `newsAudio.ts` も同じ判定を共有している）。この関数を使うのは机のアバタータブだけ —
 * 「アバターはどの記事から作ったか」を見せるためのもの。
 */
export function articleKeyOfArtifact(artifact: ReadJobArtifact | null | undefined): string {
  const stem = stemOf(String(artifact?.name ?? ""));
  if (!stem) return "";
  return isAvatarArtifact(artifact) ? stem.replace(/-photo-avatar$/, "").replace(/-avatar$/, "") : stem;
}

/**
 * 成果物の呼び名。**3 か所（読み上げタブ・アバタータブ・NewsAgent のパネル）が同じ語を使う**
 * ようにするための 1 か所。`kind` だけでは音声と映像しか分からず、アバターの映像も
 * 「映像」になってしまう（同じ記事に 2 つの映像が並ぶので、どちらか分からなくなる）。
 */
export function artifactLabelOf(artifact: ReadJobArtifact | null | undefined): string {
  if (!artifact || typeof artifact !== "object") return "成果物";
  const kind = String(artifact.kind ?? "").toLowerCase();
  if (kind === "voice") return "音声";
  if (kind === "video") return isAvatarArtifact(artifact) ? "アバター" : "映像";
  return kind || "成果物";
}

/**
 * ジョブ一覧 → slug ごとの印。
 *
 * `projectId` を渡すと**そのプロジェクトのジョブだけ**を数える。成果物は
 * プロジェクトごとの置き場にあるので、別のプロジェクトで作った物を「済み」と
 * 数えると、無い音声を有ると言うことになる。空を渡したときは絞らない
 * （まだプロジェクトを選んでいない机）。
 *
 * **ここは読者面と軸が 1 つ違う（未決）。** 読者面は project を見ない —
 * `app/home/news/page.tsx` と `news/src/core/newsAudio.ts` のどちらにも `project_id` は
 * 出てこない（2026-10-03 実測）。**机は見る。** だからプロジェクトが 2 つ以上あり、
 * 記事 X の音声を机が選んでいない側で作ると、机には印が出ないのに読者面には ▶ が付く
 * （逆向きも同じ）。1 つの事実を 2 つの角度から見る、という上の話が**この 1 軸でだけ**
 * 崩れている。janabiz にプロジェクトが 2 つ以上あるかは未確認で、1 つなら実害は無い。
 * 寄せるときは片方だけ直せば両面が揃う（この関数が唯一の分岐点）— どちらへ寄せるかは
 * 決まっていないので、**勝手に緩めない**。
 */
export function indexReadArticles(
  jobs: ReadJob[] | null | undefined,
  projectId: string | null,
): ReadIndex {
  const index: ReadIndex = new Map();
  if (!Array.isArray(jobs)) return index;
  const want = String(projectId ?? "").trim();

  for (const job of jobs) {
    if (!job || typeof job !== "object") continue;
    if (want && String(job.project_id ?? "").trim() !== want) continue;

    const items = Array.isArray(job.items) ? job.items : [];
    const artifacts = Array.isArray(job.artifacts) ? job.artifacts : [];

    for (const item of items) {
      if (!item || typeof item !== "object") continue;
      const key = String(item.key ?? "").trim();
      if (!key) continue;

      // 同じ記事を 2 つのジョブが持つことがある（作り直し）。印は足し合わせる。
      const mark: ReadMark = index.get(key) ?? { voice: false, video: false, running: false };

      const status = String(item.status ?? "").toLowerCase();
      if (status === "running" || status === "queued") mark.running = true;

      for (const artifact of artifacts) {
        if (!artifact || typeof artifact !== "object") continue;
        if (stemOf(String(artifact.name ?? "")) !== key) continue;
        // 開けない成果物は数えない。storageUrl が無い行は、画面から辿れない
        // だけでなく、公開まで行っていないことが多い。
        if (!String(artifact.storageUrl ?? "").trim()) continue;
        const kind = String(artifact.kind ?? "").toLowerCase();
        if (kind === "voice") mark.voice = true;
        if (kind === "video") mark.video = true;
      }

      // 何も立たない記事（持っていたが成果物も進みも無い）は載せない。
      // 載せると「印があるのに何も出ない」行になる。
      if (mark.voice || mark.video || mark.running) index.set(key, mark);
    }
  }

  return index;
}

/**
 * 記事 1 本の**開ける成果物の URL**（無ければ null）。
 *
 * `ReadMark` が真偽（▶ を立てるか）なのと違い、こちらは URL そのもの。記事タブの印は
 * 「有る」を見せるだけでなく**押して開いて確かめる**ための物（ユーザー要望）なので、
 * 真偽では足りない。
 */
export type ArticleReadArtifacts = { voice: string | null; avatar: string | null };

export type ArticleArtifactIndex = Map<string, ArticleReadArtifacts>;

/**
 * ジョブ一覧 → slug ごとの「開ける成果物の URL」。記事タブの印（🔊/🎬）の元。
 *
 * ── なぜ indexReadArticles を使い回さないか ───────────────────────
 * あちらは「記事の ▶ を立てるか」の判定で、**アバターを数えない**（アバターは音声でも
 * 記事の映像でもないので別物として扱うのが正しい — 読者面の `newsAudio.ts` と同じ
 * 判定）。記事タブの印は逆に**アバターを数える**のが仕事で、要る物が違う。見分け方
 * そのものは同じ 3 本（`stemOf`・`articleKeyOfArtifact`・`isAvatarArtifact`）に乗るので、
 * 規則が 2 つになるわけではない。
 *
 * ── 数える物 ──────────────────────────────────────────────────────
 * `kind === "voice"` の成果物（🔊）と `isAvatarArtifact` の成果物（🎬）。
 * **記事そのものの映像（`jb-x.mp4`）は数えない** — 読み上げでも放送でもない。
 *
 * ── `projectId` について ─────────────────────────────────────────
 * 形は `indexReadArticles` と同じだが、**記事タブは null で呼ぶ**。印は「読者が実際に
 * 開けるか」を映す物差しなので、読者面と同じ軸（project を見ない）に合わせる —
 * 上の「軸が 1 つ違う（未決）」をどちらへ寄せるか決めるのはこの関数の話ではない。
 * 渡されたときは絞る（読みの規則は 1 か所のまま）。
 *
 * ── URL ──────────────────────────────────────────────────────────
 * `artifactUrl` を通した（http(s) の）物だけを入れる。**載せる直前で絞る** 1 か所を
 * ここに置くことで、押す側（記事タブ）は絞らなくてよい。storageUrl が空の行は
 * 画面から辿れないだけでなく、公開まで行っていないことが多いので落とす。
 *
 * 同じ記事を 2 つのジョブが持つことがある（作り直し）。**最初に当たった物が勝つ** —
 * 一覧は新しい順（`created_at desc`）に来るので、それは最新の成果物。
 */
export function indexArticleArtifacts(
  jobs: ReadJob[] | null | undefined,
  projectId: string | null,
  selections: NewsBroadcastSelection[] = [],
): ArticleArtifactIndex {
  const index: ArticleArtifactIndex = new Map();
  if (!Array.isArray(jobs)) return index;
  const want = String(projectId ?? "").trim();

  for (const job of jobs) {
    if (!job || typeof job !== "object") continue;
    if (want && String(job.project_id ?? "").trim() !== want) continue;

    const items = Array.isArray(job.items) ? job.items : [];
    const artifacts = Array.isArray(job.artifacts) ? job.artifacts : [];

    for (const item of items) {
      if (!item || typeof item !== "object") continue;
      const key = String(item.key ?? "").trim();
      if (!key) continue;

      const found: ArticleReadArtifacts = index.get(key) ?? { voice: null, avatar: null };

      for (const artifact of artifacts) {
        if (!artifact || typeof artifact !== "object") continue;
        if (articleKeyOfArtifact(artifact) !== key) continue;
        const href = artifactUrl(artifact.storageUrl);
        if (href === null) continue;
        const kind = String(artifact.kind ?? "").toLowerCase();
        if (kind === "voice" && found.voice === null) found.voice = href;
        // Avatar URLs are resolved once below from the Post selection, with the
        // legacy -avatar.mp4 fallback. Do not let job order choose a variant.
      }

      const selectedAvatar = resolveBroadcastArtifact(key, item.post_id, artifacts, selections);
      const selectedAvatarUrl = artifactUrl(String(selectedAvatar?.storageUrl ?? ""));
      if (selectedAvatarUrl !== null) {
        found.avatar = selectedAvatarUrl;
      } else {
        // The desk index is intentionally broader than the public reader: older
        // workers may have written the avatar marker only in metadata while
        // keeping the base video name. Keep the public resolver name-based, but
        // let the desk open a non-draft metadata-marked avatar after the
        // selection and legacy-name fallbacks have been exhausted.
        const metadataAvatar = artifacts.find((artifact) => {
          if (!artifact || String(artifact.kind ?? "").toLowerCase() !== "video") return false;
          if (articleKeyOfArtifact(artifact) !== key) return false;
          if (!isAvatarArtifact(artifact)) return false;
          if (String(artifact.metadata?.adoption ?? "").toLowerCase() === "draft") return false;
          return artifactUrl(artifact.storageUrl) !== null;
        });
        const metadataAvatarUrl = artifactUrl(metadataAvatar?.storageUrl);
        if (metadataAvatarUrl !== null) found.avatar = metadataAvatarUrl;
      }

      // 何も無い記事は載せない（載せると「印があるのに何も出ない」行になる）。
      if (found.voice !== null || found.avatar !== null) index.set(key, found);
    }
  }

  return index;
}

/** 記事 1 本の印。無ければ null（＝まだ何も無い）。 */
export function articleArtifactsOf(
  index: ArticleArtifactIndex,
  slug: string,
): ArticleReadArtifacts | null {
  const key = String(slug ?? "").trim();
  if (!key) return null;
  return index.get(key) ?? null;
}

/**
 * 記事 1 本の「読み上げ・放送の有無」（絞り込み用）。index に無い記事は
 * `{ voice: false, avatar: false }` — 調べた結果「無い」は false で言える。
 *
 * **「まだ読んでいない」（jobs が未着）はここでは表せない** — `indexArticleArtifacts` は
 * 未着でも空の Map を返す（null を返さない）ので、呼ぶ側が `jobs === null ? null : …` で
 * 写す。slug が空なら null（数える対象が無い）。
 */
export function artifactPresenceOf(
  index: ArticleArtifactIndex,
  slug: string,
): { voice: boolean; avatar: boolean } | null {
  const key = String(slug ?? "").trim();
  if (!key) return null;
  const read = index.get(key) ?? null;
  return { voice: read !== null && read.voice !== null, avatar: read !== null && read.avatar !== null };
}

/** 記事 1 本の印。無ければ null（＝まだ何も無い）。 */
export function readMarkOf(index: ReadIndex, slug: string): ReadMark | null {
  const key = String(slug ?? "").trim();
  if (!key) return null;
  return index.get(key) ?? null;
}

/**
 * 記事を「音声が在る / まだ」の 2 つに分ける。**並びは渡された順のまま**
 * （分けるだけで、並べ替えはしない）。
 *
 * 分ける軸は `voice || video` であって `running` ではない。まだ作っている
 * 途中の記事を「済み」の側へ入れると、まだ出来ていない物を出来たと言うことになる。
 */
export function splitByRead<T extends { slug: string }>(
  posts: T[],
  index: ReadIndex,
): { fresh: T[]; done: T[] } {
  const fresh: T[] = [];
  const done: T[] = [];
  for (const post of posts) {
    const mark = readMarkOf(index, post?.slug ?? "");
    if (mark && (mark.voice || mark.video)) done.push(post);
    else fresh.push(post);
  }
  return { fresh, done };
}

/** 印の文言。何も無ければ空（呼ぶ側が「出さない」を決める）。 */
export function readMarkLabel(mark: ReadMark | null): string {
  if (!mark) return "";
  const made = [mark.voice ? "音声" : "", mark.video ? "映像" : ""].filter(Boolean).join("・");
  if (made) return `${made}あり`;
  if (mark.running) return "作成中";
  return "";
}
