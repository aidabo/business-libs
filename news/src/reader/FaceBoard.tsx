"use client";

import type { NewsPost as Post } from "../core";
import type { Face } from "../core";
import ArticleCell from "./ArticleCell";
import { selectFaceLines, subtopicsOfFace } from "../core";

// 面立て。面ごとに 1 行、その行に記事を横に並べる。
//
// かつては面ごとに縦 1 列の箱を作り、箱を横に流していた（.jb-faces）。それだと
// 面が 2 つしか立たない日に画面の左半分だけが埋まり、残りが空く。行にすると
// 面の数がいくつでも幅を使い切る。
//
// 記事の描画は ArticleCell に任せる。面立てと結果一覧で同じ見た目にするため。
//
// 1 本も無い面は面ごと落ちる（selectFaceLines が落とす）。空の見出しを並べない。
//
// 見出しの下に中分類（その面の記事に付いている公開タグ）を並べる。面そのものは
// 内部タグなので読者には見せず、読者が見るのはこの中分類になる。
// 中分類は公開タグなので、既存の面ページ（/tag/[slug]/）へそのまま行ける。

/**
 * 中分類の表示数。分類の全部ではなく、その面の匂いが分かるだけ並べる。
 *
 * 6 ではスポーツ面の競技（8 語）が入りきらず、後ろの 2 語が黙って消えていた。
 * 8 なら、いまの作りで 2 本以上ある分類はどの面でも収まる。行は折り返すので、
 * 増えても幅は壊れない。
 */
const TOPIC_LIMIT = 8;

export default function FaceBoard({
  posts,
  faces,
  excludeIds,
}: {
  posts: Post[];
  faces: Face[];
  excludeIds: string[];
}) {
  const lines = selectFaceLines(posts, faces, excludeIds, 4);
  if (lines.length === 0) return null;

  return (
    <div className="jb-face-rows">
      {lines.map(({ face, posts: facePosts }) => {
        const topics = subtopicsOfFace(posts, face).slice(0, TOPIC_LIMIT);
        const headingId = `jb-face-${face.slug || face.label}`;

        return (
          <section key={face.label} className="jb-face-row" aria-labelledby={headingId}>
            <div className="jb-face-side">
              <h2 id={headingId} className="jb-face-name">
                {face.label}
              </h2>
              {topics.length > 0 && (
                <ul className="jb-face-topics">
                  {topics.map((topic) => (
                    <li key={topic.name}>
                      <a href={`/tag/${topic.slug}/`} className="jb-link">
                        {topic.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="jb-face-items">
              {facePosts.map((post) => (
                <ArticleCell key={post.id} post={post} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
