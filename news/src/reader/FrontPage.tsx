"use client";

import type { NewsPost as Post } from "../core";
import { FONT_SANS, FONT_SERIF, JB } from "../core";
import { stamp } from "./ArticleCell";
import ListenButton from "./ListenButton";
import { faceOf, safeMediaUrl, selectFrontPage, thumbOf } from "../core";

// 第一面（spec §4 の②）。主役 1・準主役 2・短信 3。
// 画像が無い記事は、枠ごと出さない（§4.2）。
//
// 映像を持つ記事は、この枠の中でそのまま動かす。動かすのは主役だけにする
// （Thumb の motion）— 第一面が全部動くと、どれが主役なのか分からなくなる。

function Thumb({ post, ratio, motion = false }: { post: Post; ratio: string; motion?: boolean }) {
  const still = thumbOf(post);
  if (!still) return null;

  const frame = {
    width: "100%",
    aspectRatio: ratio,
    objectFit: "cover" as const,
    display: "block",
    background: JB.paperDeep,
  };

  // 映像。この枠は記事へのリンクなので、controls は付けない（押したら記事へ行く）。
  // 音も出さない — 無音でないとブラウザは自動再生を通さない。
  // aria-hidden は、装飾であるこの映像を読み上げの対象から外すため。
  //
  // src は本文から拾った値でありうるので safeMediaUrl を通す。落ちたら
  // 映像は出さず、下の静止画になる（絵は thumbOf が別に持っている）。
  const movie = motion && post.type === "video" ? safeMediaUrl(post.src) : null;
  if (movie) {
    return (
      <video
        src={movie}
        poster={still}
        muted
        autoPlay
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        style={frame}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={still} alt="" style={frame} />
  );
}

/** 面名と日付。記事 1 本ごとに出す。日付の書式は ArticleCell と共通。 */
function Meta({ post, size = 12 }: { post: Post; size?: number }) {
  const face = faceOf(post);
  return (
    <div style={{ fontFamily: FONT_SANS, fontSize: size, color: JB.muted, letterSpacing: "0.04em" }}>
      {face ? `${face.label}面` : "総合"}　{stamp(post)}
    </div>
  );
}

/** 記事へのリンク。既存の記事ページ（/article/[id]/）へ送る。この面の中でだけ使う。 */
function ArticleLink({ post, children }: { post: Post; children: React.ReactNode }) {
  return (
    <a href={`/article/${post.id}/`} className="jb-card" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
      {children}
    </a>
  );
}

export default function FrontPage({ posts }: { posts: Post[] }) {
  const front = selectFrontPage(posts);
  if (!front.lead) return null;

  // 下段（.jb-briefs）は短信だけ。ここに front.sub を混ぜると、準主役が
  // 上段と下段の 2 回出て、同じ記事が 1 面に 2 つ並ぶ（spec §4.1・§11-2）。
  const rest = front.briefs;

  return (
    <section id="front" className="jb-news-section">
      <div className="jb-front">
        <div>
          <ArticleLink post={front.lead}>
            <Thumb post={front.lead} ratio="16 / 9" motion />
            <div style={{ marginTop: 12 }}>
              <Meta post={front.lead} />
              <h2
                style={{
                  fontFamily: FONT_SERIF,
                  fontSize: "clamp(24px, 3.2vw, 40px)",
                  fontWeight: 700,
                  lineHeight: 1.3,
                  color: JB.ink,
                  margin: "10px 0 0",
                }}
              >
                {front.lead.title}
              </h2>
              {front.lead.excerpt && (
                <p
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 16,
                    lineHeight: 1.95,
                    color: JB.muted,
                    margin: "12px 0 0",
                    maxWidth: 720,
                  }}
                >
                  {front.lead.excerpt}
                </p>
              )}
            </div>
          </ArticleLink>

          {/*
            縦書きの面は主役にだけ出す（この面の読み方の見本）。
            入れ子の <a> は不正なので ArticleLink の外に置く。
            タップ領域は 44px（spec §2.2）。

            飾りの「縦」の字は置かない。aria-hidden は読み上げから外すだけで
            画面からは消えないので、字を足すと link の文字列が
            「縦縦書きで読む」になる（実際にそう出ていた）。
            ラベルは「縦書きで読む」だけにする。
          */}
          {/*
            読み上げ（あれば）と縦書き。どちらも読み方の選択なので 1 行に並べる。
            読み上げのボタンは <a> の外に置く（入れ子の操作要素を作らない）。
          */}
          <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
            <a
              href={`/article/${front.lead.id}/vertical/`}
              className="jb-link"
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: 44,
                padding: "0 12px",
                border: `1px solid ${JB.line}`,
                borderLeft: `3px solid ${JB.accent}`,
                background: JB.white,
                color: JB.ink,
                fontFamily: FONT_SANS,
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              縦書きで読む
            </a>
            <ListenButton post={front.lead} />
          </div>
        </div>

        <div className="jb-front-sub">
          {front.sub.map((post) => (
            // 読み上げのボタンを <a> の外に出すための包み。中身は今までと同じ。
            <div key={post.id}>
              <ArticleLink post={post}>
                <Thumb post={post} ratio="3 / 2" />
                <div style={{ marginTop: thumbOf(post) ? 10 : 0 }}>
                  <Meta post={post} />
                  <h3
                    style={{
                      fontFamily: FONT_SERIF,
                      fontSize: "clamp(17px, 1.8vw, 21px)",
                      fontWeight: 600,
                      lineHeight: 1.45,
                      color: JB.ink,
                      margin: "7px 0 0",
                    }}
                  >
                    {post.title}
                  </h3>
                </div>
              </ArticleLink>
              <ListenButton post={post} />
            </div>
          ))}
        </div>
      </div>

      {rest.length > 0 && (
        <div className="jb-briefs" style={{ marginTop: "clamp(18px, 2.4vw, 28px)", paddingTop: "clamp(14px, 1.8vw, 20px)", borderTop: `1px solid ${JB.line}` }}>
          {rest.map((post) => (
            <div key={post.id}>
              <ArticleLink post={post}>
                <Meta post={post} size={11.5} />
                <h3
                  style={{
                    fontFamily: FONT_SERIF,
                    fontSize: "clamp(15px, 1.5vw, 17px)",
                    fontWeight: 600,
                    lineHeight: 1.5,
                    color: JB.ink,
                    margin: "6px 0 0",
                  }}
                >
                  {post.title}
                </h3>
              </ArticleLink>
              <ListenButton post={post} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
