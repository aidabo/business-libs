"use client";

import type { NewsPost as Post } from "../core";
import { useNewsAudioCtx } from "../shared/NewsAudioContext";

// 記事カードに付く「読み上げを聞く」。読み上げの無い記事には何も出さない。
//
// 出す場所は記事カードの **外側**（`<a>` の隣）に限る。`<a>` の中に `<button>` を
// 入れるのは入れ子の操作要素になり、押したときに記事へ飛ぶのか鳴らすのかが
// 曖昧になる。FrontPage の「縦書きで読む」を `<a>` の外に置いているのと同じ理由。
//
// 印（▶ / ❚❚）は aria-hidden にする。読み上げに渡すのは文字のほう
// （「▶ 読み上げを聞く」と読ませても、記号の名前は伝わらない）。
export default function ListenButton({ post }: { post: Post }) {
  const { voiceOf, isCurrent, isPlaying, toggle } = useNewsAudioCtx();

  if (voiceOf(post) === null) return null;

  const current = isCurrent(post);
  const on = isPlaying(post);
  const label = on ? "一時停止" : current ? "続きを聞く" : "読み上げを聞く";

  return (
    <button
      type="button"
      className="jb-listen"
      data-playing={on ? "true" : "false"}
      onClick={() => toggle(post)}
    >
      <span aria-hidden="true" className="jb-listen-mark">
        {on ? "❚❚" : "▶"}
      </span>
      <span>{label}</span>
    </button>
  );
}
