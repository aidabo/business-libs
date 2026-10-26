"use client";

import type { NewsPost as Post } from "../core";
import {FONT_SANS, FONT_SERIF, JB} from "../core";
import BigPlayVideo from "../shared/BigPlayVideo";
import MoreLink from "./MoreLink";
import {faceOf, publishedDateLabel, thumbOf} from "../core";

export default function AvatarBroadcastBand({
  posts,
  avatarOf,
  moreHref = null,
}: {
  posts: Post[];
  avatarOf: (post: Post) => string | null;
  /**
   * 一覧面（/home/news/broadcast）への導線。紙面の帯は最新 10 本までしか出さない
   * ので、それより多い日だけ続きの行き先をここに出す（切るのも出し分けも NewsPaper の側）。
   * 一覧面自身は渡さない — 自分へ戻るリンクになるため。
   */
  moreHref?: string | null;
}) {
  const rows = posts
    .map((post) => ({post, url: avatarOf(post)}))
    .filter((row): row is {post: Post; url: string} => Boolean(row.url));
  if (!rows.length) return null;

  return (
    <section id="broadcast" className="jb-news-section" aria-labelledby="avatar-broadcast-title">
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 12}}>
        <div>
          <div style={{fontFamily: FONT_SANS, fontSize: 12, letterSpacing: "0.12em", color: JB.accent}}>AI NEWS BROADCAST</div>
          <h2 id="avatar-broadcast-title" style={{fontFamily: FONT_SERIF, fontSize: "clamp(22px, 3vw, 34px)", margin: "4px 0 0", color: JB.ink}}>バーチャル放送</h2>
        </div>
        <div style={{fontFamily: FONT_SANS, fontSize: 12, color: JB.muted}}>AI生成・編集承認済み</div>
      </div>
      <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16}}>
        {rows.map(({post, url}) => {
          const face = faceOf(post);
          const date = publishedDateLabel(post);
          return (
            <article key={post.id} style={{background: JB.white, border: `1px solid ${JB.line}`, padding: 10}}>
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16 / 9",
                  overflow: "hidden",
                  background: JB.paperDeep,
                }}
              >
                {/* 机と同じ大きな ▶（BigPlayVideo）。標準の操作は一度再生してから出る。 */}
                <BigPlayVideo src={url} poster={thumbOf(post) || null} background={JB.paperDeep} />
              </div>
              <div style={{display: "flex", gap: 8, alignItems: "baseline", fontFamily: FONT_SANS, fontSize: 12, color: JB.muted, marginTop: 8}}>
                <span>{face ? `${face.label}面` : "総合"}</span>
                {/* 公開日。読者面の他の日付と同じ物差し（JST・「9月26日」の形）。 */}
                {date !== "" && <span>{date}</span>}
              </div>
              <h3 style={{fontFamily: FONT_SERIF, fontSize: 18, lineHeight: 1.45, margin: "4px 0 0", color: JB.ink}}>{post.title}</h3>
            </article>
          );
        })}
      </div>
      {moreHref !== null && <MoreLink href={moreHref}>すべての放送を見る</MoreLink>}
    </section>
  );
}
