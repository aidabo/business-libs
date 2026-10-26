// 成果物の URL を `href` に載せてよいか、の判定を 1 か所に持つ。
//
// ── なぜ許可表か ───────────────────────────────────────────────────
// 落とす側の列挙（`javascript:` を消す…）は `java\nscript:` のような書き方で
// 漏れる。**http(s) だけを通す**許可表なら漏れない。
//
// ── 同じ規則を使う面 ───────────────────────────────────────────────
// どれか 1 つだけ直すと、そこだけが穴になる（実際、机だけ直して 2 面が漏れていた）。
//
//   読者面の音声・映像    newsAudio.ts の mediaUrl（この関数へ委譲）
//   机（/dashboard/news） ReadTab の成果物リンク
//   NewsAgent のパネル     ArtifactLinks 経由
//   news job の詳細画面    ArtifactLinks 経由
//
// 増やすときは、面ごとに書かずここを通す（`components/press/news/ArtifactLinks.tsx`）。

/**
 * 成果物の URL を、**`href` に載せてよい形に絞る**（`http(s)` 以外は null）。
 *
 * `storageUrl` は worker が組み立てた絶対 URL だが、行は Ghost に在るので、書ける者が
 * `javascript:` を置けないわけではない — 載せて押させると、押した編集者のセッション
 * （Ghost の cookie は `/ghost` に張られている）でそのまま動く。
 *
 * **許可表であって禁止表ではない。** 除く側の列挙（`javascript:` を消す…）は
 * `java\nscript:` のような書き方で漏れる。
 */
export function artifactUrl(value: string | null | undefined): string | null {
  const url = String(value ?? "").trim();
  return /^https?:\/\//i.test(url) ? url : null;
}
