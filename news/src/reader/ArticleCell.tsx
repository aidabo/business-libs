"use client";

import type { NewsPost as Post } from "../core";
import ListenButton from "./ListenButton";
import { faceOf, isUpdated, thumbOf } from "../core";

// 一覧に並ぶ記事 1 本。面立ての行と、絞り込んだときの結果一覧で同じものを使う。
//
// 見出しと前文は行数で切る（.jb-clamp-2 / .jb-clamp-3）。切り詰めは CSS に任せる。
// 文字数で切ると、禁則や全角半角の混ざり具合で行数が揃わない。
//
// 画像は記事が持っているときだけ出す（枠だけ残さない）。

/** 公開時刻。1 行に収めるため「9月26日 07:30」の形にする。 */
export function stamp(post: Post): string {
  const at = new Date(post.published_at);
  if (Number.isNaN(at.getTime())) return "";
  return `${at.getMonth() + 1}月${at.getDate()}日 ${String(at.getHours()).padStart(2, "0")}:${String(at.getMinutes()).padStart(2, "0")}`;
}

export default function ArticleCell({
  post,
  showFace = false,
}: {
  post: Post;
  /** 面名を出すか。面立ての中では面が自明なので出さない。 */
  showFace?: boolean;
}) {
  const face = faceOf(post);
  const updated = isUpdated(post);
  const still = thumbOf(post);

  return (
    // 読み上げのボタンは <a> の **外** に置く（入れ子の操作要素を作らない）。
    // 読み上げの無い記事では ListenButton が何も返さないので、この包みは
    // 素の 1 段になるだけで見た目は変わらない。
    <div className="jb-cell-wrap">
      <a href={`/article/${post.id}/`} className="jb-card jb-cell">
        {/*
          ここは静止画のままにする。映像を持つ記事でも、一覧の中で動かすのは
          第一面の主役だけ（FrontPage の Thumb の motion）。面立てや絞り込みの
          結果が一斉に動くと、どれを読めばよいか分からなくなる。
        */}
        {still ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={still} alt="" className="jb-cell-img" />
        ) : null}

        <h3 className="jb-cell-title jb-clamp-3">{post.title}</h3>

        {post.excerpt ? <p className="jb-cell-excerpt jb-clamp-2">{post.excerpt}</p> : null}

        <p className="jb-cell-meta">
          {showFace ? <span className="jb-cell-face">{face ? face.label : "総合"}</span> : null}
          <span>{stamp(post)}</span>
          {updated ? <span className="jb-cell-updated">更新</span> : null}
        </p>
      </a>

      <ListenButton post={post} />
    </div>
  );
}
