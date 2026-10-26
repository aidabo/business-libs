"use client";

import type { NewsPost as Post } from "../core";
import { FONT_SANS, FONT_SERIF, JB } from "../core";
import { useEffect, useRef } from "react";
import { useNews } from "../adapter/NewsContext";
import ListenButton from "./ListenButton";
import { stamp } from "./ArticleCell";
import MoreLink from "./MoreLink";
import { useNewsAudioCtx } from "../shared/NewsAudioContext";
import { faceOf, newestFirst } from "../core";
import { useArticleLinker } from "../shared/NewsLink";

// 「読み上げ」の帯（面ナビの #listen）。読み上げの出来ている記事だけを並べる。
//
// ── なぜ「音声版」と呼ばないか ────────────────────────────────────
// 鳴るのは、いまは 1 日のうち数本だけ（読み上げのジョブを掛けた記事）。紙面まるごと
// の音声版ではないので、「音声版」と名乗ると全部が聞けると読まれる。数を添えて
// 「読み上げ」と呼ぶ。
//
// ── なぜ記事一覧と別に置くか ──────────────────────────────────────
// 面立て（#faces）は紙面の順に並べる場所で、音声の有無は紙面の並びと関係がない。
// 別に 1 帯作って、聞ける記事だけを集めたほうが探しやすい。
//
// 並びは公開の新しい順（2026-10-14。取ってくる口は主役が先に来るので、ここで並べ直す）。
// 紙面の帯は `limit`（最新 10 本）で切り、それより多い日だけ `moreHref`（/home/news/listen —
// すべての読み上げの一覧面。同じ部品を切らずに使う）への導線を出す。
//
// ── カードの中で鳴らす（2026-10-14）────────────────────────────────
// 帯のカードは下の帯（AudioBar）を使わず、カードの中のプレーヤー（AudioCard）で鳴らす —
// 長さが見え、その場で止められる。第一面・記事カードの「読み上げを聞く」は下の帯のまま。
// 同時に 2 つ鳴らさない: カードで鳴らし始めたら下の帯と他のカードを止め、下の帯が
// 鳴り始めたらカードを止める。
export default function ListenBand({
  posts,
  limit = null,
  moreHref = null,
}: {
  posts: Post[];
  /** 出す本数（紙面の帯は 10）。null は全部（一覧面。ただし渡された記事 = useNewsPosts の上限 500 本の内側）。 */
  limit?: number | null;
  /** 「すべての読み上げを聴く」の行き先。`limit` を超える本数がある日だけ出す。 */
  moreHref?: string | null;
}) {
  const { voiceOf, now, playing, stop } = useNewsAudioCtx();
  const { AudioCard } = useNews().adapter;
  const linkOf = useArticleLinker();
  const sectionRef = useRef<HTMLElement | null>(null);
  const voiced = newestFirst(posts.filter((post) => voiceOf(post) !== null));
  const items = limit === null ? voiced : voiced.slice(0, limit);
  const showMore = moreHref !== null && limit !== null && voiced.length > limit;

  // 下の帯が鳴り始めたら、帯のカードのプレーヤーを止める。
  useEffect(() => {
    if (!playing) return;
    sectionRef.current?.querySelectorAll("audio").forEach((audio) => {
      if (!audio.paused) audio.pause();
    });
  }, [playing]);

  if (items.length === 0) return null;

  // カードで鳴らし始めた: 他のカードを止め、下の帯が出ていれば閉じる。
  const onCardPlay = (postId: string) => {
    sectionRef.current?.querySelectorAll<HTMLElement>(".jb-listen-player").forEach((player) => {
      if (player.dataset.postId === postId) return;
      player.querySelectorAll("audio").forEach((audio) => {
        if (!audio.paused) audio.pause();
      });
    });
    if (now !== null) stop();
  };

  return (
    <section id="listen" className="jb-news-section" ref={sectionRef}>
      <div className="jb-face-head">
        <h2
          style={{
            fontFamily: FONT_SERIF,
            fontSize: "clamp(18px, 2vw, 23px)",
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: JB.ink,
            margin: 0,
          }}
        >
          読み上げ
        </h2>
        <span style={{ fontFamily: FONT_SANS, fontSize: 12.5, color: JB.muted }}>
          {voiced.length} 本
        </span>
      </div>

      <p style={{ fontFamily: FONT_SANS, fontSize: 13, lineHeight: 1.9, color: JB.muted, margin: "10px 0 0" }}>
        紙面の記事を自動音声で読み上げます。カードの中でそのまま聞けます。
      </p>

      <div className="jb-listen-grid">
        {items.map((post) => {
          const face = faceOf(post);
          return (
            <div key={post.id} className="jb-listen-item">
              <p className="jb-listen-meta">
                {face ? `${face.label}面` : "総合"}　{stamp(post)}
              </p>
              <a className="jb-listen-title jb-clamp-3" href={linkOf(post).href} onClick={linkOf(post).onClick}>
                {post.title}
              </a>
              <div className="jb-listen-player" data-post-id={post.id}>
                {AudioCard ? (
                  <AudioCard src={voiceOf(post) ?? ""} title="読み上げ" playOnHeaderClick onPlay={() => onCardPlay(post.id)} />
                ) : (
                  // ホストがカードのプレーヤーを渡さなければ、下の帯で鳴らす。
                  <ListenButton post={post} />
                )}
              </div>
            </div>
          );
        })}
      </div>
      {showMore && moreHref !== null && <MoreLink href={moreHref}>すべての読み上げを聴く</MoreLink>}
    </section>
  );
}
