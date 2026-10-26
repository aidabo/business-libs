"use client";

import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { useT } from "../adapter/NewsContext";
import { NewsIcon } from "./icons";

/**
 * カードの動画（大きな ▶）。**机（記事・素材・バーチャル放送のタブ）と読者面のバーチャル放送
 * （/home/news の帯・/home/news/broadcast）が同じ 1 つを使う**（2 つに書くと、片方だけ ▶ の
 * 大きさや再生の扱いが変わる）。元は机の DeskVideo（2026-10-14 に共用の場所へ移した）。
 *
 * 見た目と操作は旧素材タブの `components/gallery/GalleryAssetCard` に揃える: 止まっている間は
 * 中央に大きな丸い ▶（68px・PlayArrowRounded 44）を出し、押すとその場で再生・停止する。
 * 再生中は ▶ を隠す。
 *
 * 標準の操作（`controls`）は**一度再生してから**出す。止まっている間から出すと、ブラウザの
 * 置き絵の ▶ や操作帯が大きな ▶ と重なり、小さい方が見える（画面で確認したユーザー指摘
 * 2026-10-14）。再生後は止めても操作帯が残り、シークできる。
 *
 * 押した操作はカードへ伝えない — カードを覆うリンク（記事ページ行き）を動かさない。
 * 机では呼ぶ側がこの部品を `ABOVE_CARD_LINK` の段に置く。`src` / `poster` は呼ぶ側が
 * 通した（http(s) の）物だけを渡す。
 */
export default function BigPlayVideo({
  src,
  poster,
  height = "100%",
  background = "#000",
}: {
  src: string;
  poster?: string | null;
  height?: number | string;
  /** 映像の地（読者面は紙の色）。 */
  background?: string;
}) {
  const t = useT();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    setPlaying(false);
    setStarted(false);
  }, [src]);

  const toggle = async (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    try {
      if (video.paused || video.ended) {
        await video.play();
      } else {
        video.pause();
      }
    } catch {
      // 自動再生の制限で止められたときは、標準の操作を出して手で再生できるようにする。
      setStarted(true);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height, background, overflow: "hidden" }}>
      <video
        ref={videoRef}
        src={src}
        poster={poster ?? undefined}
        controls={started}
        preload="metadata"
        playsInline
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", background }}
      />
      {!playing && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <button
            type="button"
            aria-label={t("Play video")}
            onClick={toggle}
            onMouseDown={(e) => e.stopPropagation()}
            className="jb-bigplay"
            style={{
              width: 68,
              height: 68,
              borderRadius: 999,
              border: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(15,23,42,0.62)",
              color: "#fff",
              boxShadow: "0 10px 30px rgba(15,23,42,0.28)",
              pointerEvents: "auto",
              cursor: "pointer",
            }}
          >
            <NewsIcon name="play" size={44} style={{ paddingLeft: 2 }} />
          </button>
        </div>
      )}
    </div>
  );
}
