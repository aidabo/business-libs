"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import type { NewsPost as Post } from "../core";
import { FONT_SANS, FONT_SERIF, JB } from "../core";
import { useNews, useViewerKind, type NewsMemberMode } from "../adapter/NewsContext";
import { NewsIcon } from "../shared/icons";
import { useNewsAudioCtx } from "../shared/NewsAudioContext";
import { GUEST_PROMO } from "./content";
import type { PaperEdition } from "../core";
import { broadcastRenditionOf } from "../core";
import type { NewsPresenter } from "../core";
import { newestFirst, thumbOf } from "../core";

/**
 * ログインしていない人への案内（ユーザー指示 2026-10-15）。紙面のいちばん上に出す。
 *
 * **会員もスタッフもログインしていないと分かったときだけ**出す。どちらかがまだ分からない間は
 * 出さない — 出してから消すと、ログイン済みの人に一瞬だけ売り込みが見えて、紙面が下へ跳ぶ。
 */
type PromoProps = {
  posts: Post[];
  /** 記事の放送映像。省略時はページの読み上げ一覧（NewsAudioBar などが登録）から引く。 */
  avatarOf?: (post: Post) => string | null;
  /** 配信中の紙面（`host-news-editions-public`）。1 件目の 1 ページ目を絵に使う。 */
  editions?: PaperEdition[];
  /** バーチャルアナウンサーの顔（Avatar Profile の active な絵）。空なら顔の段を出さない。 */
  presenters?: NewsPresenter[];
};

export default function GuestPromo(props: PromoProps) {
  const viewer = useViewerKind();
  if (viewer !== "guest") return null;
  return <PromoHero {...props} />;
}

/**
 * 案内で流す放送。**口が動く版（lipsync）を先に**選ぶ（ユーザー指示 2026-10-15: 実際の lipsync で見せる）。
 * 無ければ公開の新しい順で最初の放送。読者に出るのは編集者が採用した版だけ（avatarOf が決める）なので、
 * ここで選べる lipsync も採用済みの物に限られる。
 */
export function pickPromoBroadcast(posts: Post[], avatarOf: (post: Post) => string | null): { post: Post; url: string } | null {
  const rows = newestFirst(posts)
    .map((post) => ({ post, url: avatarOf(post) }))
    .filter((row): row is { post: Post; url: string } => row.url !== null);
  const lipsync = rows.find(({ post, url }) => {
    const name = decodeURIComponent(url.split("?")[0].split("/").pop() ?? "");
    return broadcastRenditionOf(String(post.slug ?? ""), name) === "photo-slideshow-lipsync";
  });
  return lipsync ?? rows[0] ?? null;
}

const FEATURE_ICON = {
  broadcast: "broadcast",
  listen: "listen",
  paper: "paper",
  members: "members",
} as const;

/**
 * 絵の材料はすべて**この紙が今出している物**から取る（作り物の絵は置かない）:
 * - 動画: 公開の新しい順で最初のバーチャル放送（無ければ記事の絵を止め絵で）
 * - 下の 3 枚: 紙面電子版の 1 ページ目と、新しい記事の絵 2 枚
 */
export function PromoHero({ posts, avatarOf: avatarOfProp, presenters = [], editions = [] }: PromoProps) {
  const audio = useNewsAudioCtx();
  const avatarOf = avatarOfProp ?? audio.avatarOf;
  const { MemberDialog } = useNews().adapter;
  const ordered = newestFirst(posts);
  const broadcast = pickPromoBroadcast(posts, avatarOf);
  const stillPost = broadcast?.post ?? ordered.find((post) => thumbOf(post) !== null) ?? null;
  const still = stillPost ? thumbOf(stillPost) : null;
  const pictures = ordered.filter((post) => post.id !== stillPost?.id && thumbOf(post) !== null).slice(0, 2);
  const paper = editions[0]?.previewUrl ? editions[0] : null;
  const motion = useMotionAllowed();
  // 登録・ログインはその場のダイアログで（/member へ移らない）。href は JS が無いときの受け皿。
  const [join, setJoin] = useState<NewsMemberMode | null>(null);
  const openJoin = (mode: NewsMemberMode) => (event: MouseEvent) => {
    // ダイアログを渡されていなければ、リンクのまま会員の面へ移る。
    if (!MemberDialog) return;
    event.preventDefault();
    setJoin(mode);
  };
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // 音なしで流し続ける（autoPlay 属性は付けた後で変えても効かないので、ここで鳴らす）。
  // 止められたら（自動再生の制限）止め絵のまま — 標準の操作は出ているので手で見られる。
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !motion) return;
    // 古いブラウザの play() は Promise を返さない（undefined）ので、返った時だけ受ける。
    try {
      void video.play()?.catch(() => {});
    } catch {
      // 再生できない環境 — 止め絵のまま。
    }
  }, [motion, broadcast?.url]);

  return (
    <section className="jb-promo" aria-labelledby="jb-promo-title">
      <div className="jb-promo-media">
        {/* 札は映像の外（上）に置く — 放送の映像は紙名・題・顔・字幕を自分で映していて、どこに重ねても隠れる。 */}
        <span className="jb-promo-onair">
          <span className="jb-promo-dot" aria-hidden="true" />
          {GUEST_PROMO.onAir}
          {broadcast && <span className="jb-promo-who">{GUEST_PROMO.announcer}</span>}
        </span>
        <div className="jb-promo-screen">
          {broadcast?.url ? (
            <video
              key={broadcast.url}
              ref={videoRef}
              src={broadcast.url}
              poster={still ?? undefined}
              // 動きを減らす設定の人には動かさない（止め絵の上で、押せば標準の操作で見られる）。
              muted
              loop
              playsInline
              controls={!motion}
              preload="metadata"
              aria-label={`${GUEST_PROMO.announcer}：${broadcast.post.title}`}
            />
          ) : still ? (
            <img src={still} alt="" />
          ) : null}
          {/* 放送の映像は題を自分で映しているので、重ねて書かない。止め絵のときだけ題を添える。 */}
          {!broadcast && stillPost && (
            <div className="jb-promo-caption">
              <span className="jb-promo-title jb-clamp-2">{stillPost.title}</span>
            </div>
          )}
        </div>

        {(paper || pictures.length > 0) && (
          <div className="jb-promo-strip">
            {paper && (
              <a href={paper.viewerUrl} className="jb-promo-tile jb-promo-paper" aria-label={GUEST_PROMO.paperLabel}>
                <img src={paper.previewUrl} alt="" />
                <span>{GUEST_PROMO.paperLabel}</span>
              </a>
            )}
            {pictures.map((post) => (
              <div key={post.id} className="jb-promo-tile">
                <img src={thumbOf(post) ?? ""} alt="" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="jb-promo-copy">
        {/* 顔の段は右の列のいちばん上（ユーザー指示 2026-10-15: 上の空いた場所にアナウンサーの絵を）。 */}
        {presenters.length > 0 && (
          <div className="jb-promo-cast">
            <div className="jb-promo-cast-title" style={{ fontFamily: FONT_SERIF }}>
              {GUEST_PROMO.announcer}
            </div>
            <ul
              className="jb-promo-faces"
              style={{ ["--jb-cast-cols" as string]: String(Math.min(presenters.length, 5)) } as CSSProperties}
            >
              {presenters.map((presenter) => (
                <li key={presenter.id}>
                  <img src={presenter.imageUrl} alt="" loading="lazy" />
                  <span>{presenter.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div style={{ fontFamily: FONT_SANS, fontSize: 11, letterSpacing: "0.24em", color: JB.accent }}>{GUEST_PROMO.eyebrow}</div>
        <h2 id="jb-promo-title" style={{ fontFamily: FONT_SERIF, fontWeight: 700, margin: "8px 0 0", color: JB.paper }} className="jb-promo-heading">
          {GUEST_PROMO.heading.map((part) => (
            <span key={part} style={{ display: "inline-block" }}>{part}</span>
          ))}
        </h2>
        <p className="jb-promo-lead" style={{ fontFamily: FONT_SANS, color: JB.mutedOnDark, margin: "12px 0 0" }}>
          {GUEST_PROMO.lead}
        </p>
        <ul className="jb-promo-features">
          {GUEST_PROMO.features.map((feature) => {
            const icon = FEATURE_ICON[feature.key as keyof typeof FEATURE_ICON];
            return (
              <li key={feature.key}>
                <NewsIcon name={icon} size={18} color={JB.accent} />
                {feature.label}
              </li>
            );
          })}
        </ul>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
          <a href={`${GUEST_PROMO.href}&mode=signup`} className="jb-btn jb-promo-primary" onClick={openJoin("signup")}>
            {GUEST_PROMO.primaryLabel}
          </a>
          <a href={GUEST_PROMO.href} className="jb-btn jb-btn-light jb-promo-secondary" onClick={openJoin("signin")}>
            {GUEST_PROMO.loginLabel}
          </a>
        </div>
        <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: JB.mutedOnDark, marginTop: 12 }}>{GUEST_PROMO.aiNote}</div>
      </div>
      {MemberDialog ? (
        <MemberDialog open={join !== null} mode={join ?? "signup"} presenters={presenters} onClose={() => setJoin(null)} />
      ) : null}
    </section>
  );
}

/** `prefers-reduced-motion: reduce` なら false。SSR と初回描画は false（動画は動き出さない）。 */
function useMotionAllowed(): boolean {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    setAllowed(!query?.matches);
  }, []);
  return allowed;
}
