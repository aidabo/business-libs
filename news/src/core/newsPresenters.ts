// バーチャルアナウンサー（News Agent の Avatar Profile）を、読者面に出せる形にする純関数。
//
// 元は Ghost の `social/ai/news/avatar-profiles`（スタッフ／鍵の口）。読者のブラウザからは
// 読めないので、サーバー（app/home/news/presenters.ts）が鍵で読んでここへ通す。
// 画像は Avatar Profiles の Project（purpose `avatar_profile_assets`）に Gallery 登録された物で、
// active な version の絵だけを使う（docs/architecture/project-purpose-discovery.md）。

import { safeMediaUrl } from "./select";

/** 読者面へ渡すのは名前と絵だけ（声・slug・persona などの中身は渡さない）。 */
export type NewsPresenter = { id: string; name: string; imageUrl: string };

type ProfileRow = {
  id?: unknown;
  display_name?: unknown;
  status?: unknown;
  rights_status?: unknown;
  default_for_news?: unknown;
  active_version?: { image_url?: unknown; status?: unknown } | null;
};

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/**
 * 出してよいアナウンサーだけ残す: profile が active、権利が approved、active な version に
 * http(s) の絵がある物。下書き（画像未登録など）は出さない。並びは Ghost の順
 * （既定のアナウンサーが先、次に名前順）を保つ。
 */
export function presentersFromProfiles(rows: unknown): NewsPresenter[] {
  if (!Array.isArray(rows)) return [];
  const out: NewsPresenter[] = [];
  for (const row of rows as ProfileRow[]) {
    if (text(row?.status) !== "active" || text(row?.rights_status) !== "approved") continue;
    const version = row.active_version;
    if (!version || (version.status !== undefined && text(version.status) !== "active")) continue;
    const imageUrl = safeMediaUrl(text(version.image_url));
    const name = text(row.display_name);
    const id = text(row.id);
    if (!imageUrl || !/^https?:/i.test(imageUrl) || !name || !id) continue;
    out.push({ id, name, imageUrl });
  }
  return out;
}
