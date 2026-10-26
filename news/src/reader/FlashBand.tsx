"use client";

import type { NewsPost as Post } from "../core";
import { FONT_SANS, FONT_SERIF, JB } from "../core";
import { selectFlash } from "../core";

// 速報（spec §4 の③）。当日の記事を published_at の降順で 5 本。
// 公開後に手が入った記事には「更新」を付ける（isUpdated）。
// 第一面に出た記事は渡さない（excludeIds）ので、同じ記事が 2 回出ない。
export default function FlashBand({
  posts,
  excludeIds,
}: {
  posts: Post[];
  excludeIds: string[];
}) {
  const flash = selectFlash(posts, excludeIds, 5);
  if (flash.length === 0) return null;

  return (
    <section id="flash" className="jb-news-section">
      <div className="jb-face-head" style={{ marginBottom: "clamp(10px, 1.4vw, 14px)" }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: "clamp(18px, 2vw, 22px)", fontWeight: 700, margin: 0, color: JB.ink }}>
          速報
        </h2>
        <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: JB.muted }}>本日</span>
      </div>

      <ol className="jb-flash-list" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {flash.map(({ post, updated }) => {
          const at = new Date(post.published_at);
          const stamp = `${String(at.getHours()).padStart(2, "0")}:${String(at.getMinutes()).padStart(2, "0")}`;
          return (
            <li key={post.id} style={{ background: JB.white, margin: 0 }}>
              <a
                href={`/article/${post.id}/`}
                className="jb-card"
                style={{ display: "block", padding: "14px 16px", textDecoration: "none", color: "inherit", minHeight: 44 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FONT_SANS, fontSize: 12, color: JB.muted }}>
                  <span>{stamp}</span>
                  {updated && (
                    <span style={{ color: JB.accent, border: `1px solid ${JB.accent}`, padding: "1px 6px", fontSize: 11 }}>
                      更新
                    </span>
                  )}
                </div>
                <h3 style={{ fontFamily: FONT_SERIF, fontSize: 15.5, fontWeight: 600, lineHeight: 1.5, color: JB.ink, margin: "7px 0 0" }}>
                  {post.title}
                </h3>
              </a>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
