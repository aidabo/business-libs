"use client";

import { useEffect, useState } from "react";
import { readAllPostMedia, type PostMediaRow } from "./postMedia";

export type PostMediaState = {
  /** null = まだ読んでいない（0 件とは言わない）。 */
  rows: PostMediaRow[] | null;
  error: string | null;
  truncated: boolean;
};

/**
 * post_media を読む。**全件の読みは Console の 1 か所**（記事タブのカードの絵と素材タブが
 * 同じ行を使う — タブごとに読むと同じ 2000 件を 2 度取る）。素材タブは記事を選んだときだけ、
 * その記事の分（`postId`）を自分で読む。
 */
export default function usePostMedia(enabled: boolean, postId: string | null): PostMediaState {
  const [state, setState] = useState<PostMediaState>({ rows: null, error: null, truncated: false });

  useEffect(() => {
    if (!enabled) return;
    let live = true;
    setState({ rows: null, error: null, truncated: false });
    readAllPostMedia(postId)
      .then(({ rows, truncated }) => {
        if (live) setState({ rows, error: null, truncated });
      })
      .catch((e: unknown) => {
        if (!live) return;
        setState({ rows: [], error: e instanceof Error && e.message ? e.message : "素材を取得できませんでした", truncated: false });
      });
    return () => {
      live = false;
    };
  }, [enabled, postId]);

  return state;
}
