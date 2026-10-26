"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Face } from "../core";
import { facesFromTags } from "../core";
import { POSTS_URL, TAGS_LIST_URL, TAGS_URL, getJson, postWriteRequest, sendJson } from "./api";
import {
  FACE_CLASSIFICATION,
  MEDIUM_CLASSIFICATION,
  deskUnavailable,
  newTagPlan,
  rowsOf,
  isNewsArticle,
  tagMarkOf,
  toDeskArticle,
  toDeskTag,
  type DeskArticle,
  type DeskTag,
  type NewTagDraft,
} from "./model";

export type DeskStatus = "idle" | "loading" | "ready" | "error";

export type Desk = {
  status: DeskStatus;
  /** **読めなかった理由。** status === "error" のときだけ入る。書けなかった理由は writeError。 */
  error: string | null;
  /**
   * **書けなかった理由**（Ghost の言い分そのまま）。読みとは別に持つ。
   *
   * 読めたのに書けなかったのだから、読みの失敗と同じ帯に混ぜてはいけない —
   * 「Ghost から取れませんでした」と言えば嘘になるし、「画面の数字と一覧は出しません」も
   * 成り立たない（一覧はちゃんと読めている）。読みが成功したら消える。
   */
  writeError: string | null;
  articles: DeskArticle[];
  /** タグ全部（媒体・面・その他）。媒体と紙面のタブの一覧になる。 */
  tags: DeskTag[];
  /** 面タグの表（`classification: face`）。**下の 2 つは `tags` から導く**（別々に持たない）。 */
  faces: Face[];
  /** 媒体タグ（`classification: medium`）。 */
  mediums: DeskTag[];
  reload: () => void;
  /**
   * 記事 1 本を書く。成功したら true。失敗は writeError に入れて false（error は触らない）。
   *
   * **記事そのものを受ける**（id だけにしない）。`updated_at` をここで載せるので、
   * id しか渡せると載せ忘れが型で防げない — 呼び側は `updated_at` を気にしなくてよい。
   */
  write: (article: DeskArticle, patch: Record<string, unknown>) => Promise<boolean>;
  /**
   * タグを足す（媒体・紙面のどちらか）。成功で true。
   *
   * 名も slug も分類も**`newTagPlan` 1 本が決める** — 確認の 1 枚に出したのと同じ値で送る
   * （画面と送信で別々に組むと、見せた slug と違うタグができる）。
   */
  createTag: (draft: NewTagDraft) => Promise<boolean>;
  /** タグの名前・説明を書き換える（**slug は変えない** — URL が変わる）。成功で true。 */
  updateTag: (id: string, patch: { name?: string; description?: string }) => Promise<boolean>;
  /**
   * タグの印（`classification`）を付け替える。**媒体 ↔ 紙面 の行き来だけ**（外す口は作らない）。
   *
   * **外す（"" に戻す）は、どこにも無い。** Ghost のタグ画面にはこの欄が無く
   * （`ghost/admin/app` を `classification` で引いて 0 件・2026-10-03 実測）、
   * 机も「媒体でも紙面でもない」を表現する値を送らない。だから**機の外で付いた別の印は、
   * 一度置き換えると戻せない** — 呼ぶ側（`MediumsTab`）はそのとき 1 枚挟んで名指しする。
   */
  setTagMark: (id: string, mark: "medium" | "face") => Promise<boolean>;
};

/**
 * 机の唯一の読み手。3 つの口を並行で読む。
 *
 * 面は**タグから**読む（記事から拾うのではない）— slug ↔ label の対応表が要るため。
 * 面の付け替えで送る slug も、記事の一覧に出す「9 面」も、同じ 1 回の読みから作る。
 * 媒体も同じ 1 回の読みから導く（一覧を 2 本に割ると、片方だけ古い姿になる）。
 *
 * 取れなかったときは、前の値も作り値も残さない。古い数字を出すより、空にして理由を出す
 * （spec §4.0・V6）。
 */
export default function useDesk(enabled: boolean): Desk {
  const [status, setStatus] = useState<DeskStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [writeError, setWriteError] = useState<string | null>(null);
  const [articles, setArticles] = useState<DeskArticle[]>([]);
  const [tags, setTags] = useState<DeskTag[]>([]);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!enabled) return;
    let live = true;
    // 2 回目以降は前の一覧を出したまま読み直す（書くたびに画面が白くならない）
    setStatus((prev) => (prev === "ready" ? "ready" : "loading"));

    (async () => {
      try {
        // publish_posts（Publishing の表）は読まない。ニュースの記事は面・媒体のタグで決まり、
        // あの表とは関係が無い（読んだ id はどこも使っていなかった — 2026-10-22 に外した）。
        const [postsPayload, tagPayload] = await Promise.all([
          getJson(POSTS_URL),
          getJson(TAGS_LIST_URL),
        ]);
        if (!live) return;
        setArticles(
          rowsOf(postsPayload, "posts")
            .map(toDeskArticle)
            .filter((article): article is DeskArticle => article !== null)
        );
        // admin の口なので、応答の鍵は `tags`。host の口の `data` は使わない
        // （1 つの源＝1 つの形。混ぜると片方だけ直る）。
        setTags(
          rowsOf(tagPayload, "tags")
            .map(toDeskTag)
            .filter((tag): tag is DeskTag => tag !== null)
        );
        setError(null);
        // 読み直せたのなら、画面の一覧は今の姿になった。書けなかった帯は役目を終える。
        setWriteError(null);
        setStatus("ready");
      } catch (e) {
        if (!live) return;
        // 失敗の姿は model の 1 か所で組む（配列を消し忘れないため）。
        const failed = deskUnavailable(e instanceof Error ? e.message : "");
        setArticles(failed.articles);
        setTags(failed.tags);
        setError(failed.error);
        setStatus(failed.status);
      }
    })();

    return () => {
      live = false;
    };
  }, [enabled, nonce]);

  // 面と媒体は**同じ 1 回の読みから導く**。別々の state にすると、片方だけ更新したときに
  // 「媒体と紙面のタブには出るが、面の選択肢には無い」という食い違いが起きる。
  const faces = useMemo(() => facesFromTags(tags), [tags]);
  const mediums = useMemo(() => tags.filter((tag) => tagMarkOf(tag) === "medium"), [tags]);
  // **机に載せるのはニュースの記事だけ**（面か媒体のタグがある投稿。ユーザー決定 2026-10-15）。
  // ここで 1 回だけ絞る — 上の数字・記事・素材・読み上げ・放送・記事の選択肢はみな `articles` を読むので、
  // 下で絞り直さない。判定は `isNewsArticle` 1 本。
  const newsArticles = useMemo(() => articles.filter((article) => isNewsArticle(article, mediums)), [articles, mediums]);

  /** 書きの失敗を 1 か所で受ける（`error` には入れない — 上の doc を参照）。 */
  const failedWrite = useCallback((e: unknown, fallback: string) => {
    setWriteError(e instanceof Error && e.message ? e.message : fallback);
  }, []);

  const write = useCallback(
    async (article: DeskArticle, patch: Record<string, unknown>) => {
      // 前の失敗はもう古い。書き始めた時点で消す（押すたびに古い赤帯が残らない）。
      setWriteError(null);
      try {
        // **記事を書く唯一の口。** 送る `updated_at` はこの先の `postWriteRequest`（`api.ts`）が載せる —
        // 呼び側（記事タブ・紙面タブ・素材タブ）は気にしなくてよい。理由は `withUpdatedAt` の doc。
        // 載せ忘れると入力検証で 422 になり、その書きだけが黙って落ちる（実測 2026-10-02）。
        const { url, body } = postWriteRequest(article, patch);
        await sendJson(url, "PUT", body);
        reload();
        return true;
      } catch (e) {
        // **読みの error には入れない。** あちらは「一覧が出せない」の意味で、
        // 読みの帯は「画面の数字と一覧は出しません」と言う — 読めているのに嘘になる。
        // 言い分は `sendJson` が Ghost の `errors[0]` から組んだ文字列をそのまま持つ。
        failedWrite(e, "理由は返ってきませんでした");
        return false;
      }
    },
    [failedWrite, reload]
  );

  /**
   * タグを足す（媒体・紙面）。slug は**明示する**（Ghost は日本語を翻字して読めない語にするため）。
   *
   * 送る値は `newTagPlan` が決める — **確認画面に出したのと同じ関数**（片方だけ直すと、
   * 見せた slug と違うタグができる）。
   *
   * 失敗は**書きの帯**（`writeError`）に載せる。`write()` と同じ扱い。
   */
  const createTag = useCallback(
    async (draft: NewTagDraft) => {
      const plan = newTagPlan(draft);
      if (!plan.ok) {
        setWriteError("名前が要ります。");
        return false;
      }
      // 前の失敗はもう古い。書き始めた時点で消す（`write()` と同じ）。
      setWriteError(null);
      try {
        await sendJson(TAGS_URL, "POST", {
          tags: [
            {
              name: plan.name,
              slug: plan.slug,
              description: plan.description,
              visibility: plan.visibility,
              classification: plan.classification,
            },
          ],
        });
        reload();
        return true;
      } catch (e) {
        // **書きの帯に載せる。** `error` は `status === "error"` の枝でしか描かれず、ここは
        // `status` が `ready` のままなので、`setError` に入れると**どのタブのどの枝も描かない**
        // （押したのに何も起きない画面になる）。`DeskWriteError` は全タブ共通で出る。
        failedWrite(e, "タグを作れませんでした");
        return false;
      }
    },
    [failedWrite, reload]
  );

  /**
   * タグを書き換える（名前・説明）。**slug は変えない**（URL が変わる）。
   *
   * **`classification` を送らなくても消えない。** Ghost は送られた欄だけを書く
   * （`base/plugins/sanitize.js:64-65` の `filterData` は `_.pick(data, permitted)` で
   * **送られた欄の中から**選ぶだけ。無い欄を既定値で埋めない）。`classification` は
   * `tags` の列として `data/schema/schema.js:309` にあるので、行は `_.pick` を通る。
   * 面タグを直す既存の実装も、直す欄しか送っていない（`tools/news-worker/lib/janabiz-faces.mjs:340-343`）。
   */
  const updateTag = useCallback(
    async (id: string, patch: { name?: string; description?: string }) => {
      setWriteError(null);
      try {
        await sendJson(`${TAGS_URL}${encodeURIComponent(id)}/`, "PUT", { tags: [patch] });
        reload();
        return true;
      } catch (e) {
        failedWrite(e, "タグを書けませんでした");
        return false;
      }
    },
    [failedWrite, reload]
  );

  /** 印の付け替え（媒体 ↔ 紙面）。送るのは `classification` の 1 欄だけ（他は消えない）。 */
  const setTagMark = useCallback(
    async (id: string, mark: "medium" | "face") => {
      setWriteError(null);
      try {
        await sendJson(`${TAGS_URL}${encodeURIComponent(id)}/`, "PUT", {
          tags: [
            { classification: mark === "face" ? FACE_CLASSIFICATION : MEDIUM_CLASSIFICATION },
          ],
        });
        reload();
        return true;
      } catch (e) {
        failedWrite(e, "印を変えられませんでした");
        return false;
      }
    },
    [failedWrite, reload]
  );

  // `idle` は「まだ一度も頼んでいない」。だが `useState` の初期値は mount の 1 回しか効かないので、
  // `enabled` が false → true に変わった描画では、効果が走るまでの 1 描画だけ `idle` のままになる。
  // それを下へ素通しすると、機は「取れませんでした」とも「0 件」とも読めてしまう（V1）。
  // **頼まれたのに `idle` なら、それは読み込み中。**
  const shown: DeskStatus = status === "idle" && enabled ? "loading" : status;

  return {
    status: shown,
    error,
    writeError,
    articles: newsArticles,
    tags,
    faces,
    mediums,
    reload,
    write,
    createTag,
    updateTag,
    setTagMark,
  };
}
