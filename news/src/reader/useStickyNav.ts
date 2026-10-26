"use client";

import { RefObject, useEffect, useState } from "react";

/** ヘッダの実測高さを入れる CSS 変数。PaperStyles の scroll-margin-top が読む。 */
export const HEADER_H_VAR = "--jb-header-h";

/**
 * 固定した題字帯のための 2 つの仕事。
 *   1. 題字帯の高さを実測して CSS 変数に入れる（アンカーの着地点を下げるのに使う）
 *   2. 今どの節を見ているかを返す（面ナビの現在地表示）
 *
 * 高さを固定値にしないのは、文字サイズ「大」（ルートの font-size が 118%）と
 * 画面幅で題字帯の高さが変わるため。ずれると着地点が題字帯に隠れる。
 *
 * ids は監視する節の id を、面ナビの並び順で渡す。
 */
export default function useStickyNav(
  headerRef: RefObject<HTMLElement | null>,
  ids: string[],
): string | null {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const key = ids.join(",");

  useEffect(() => {
    const node = headerRef.current;
    if (!node) return;

    const apply = () => {
      const height = Math.round(node.getBoundingClientRect().height);
      document.documentElement.style.setProperty(HEADER_H_VAR, `${height}px`);
      setHeaderHeight((prev) => (prev === height ? prev : height));
    };

    apply();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", apply);
      return () => window.removeEventListener("resize", apply);
    }

    const observer = new ResizeObserver(apply);
    observer.observe(node);
    return () => observer.disconnect();
  }, [headerRef]);

  useEffect(() => {
    if (headerHeight <= 0) return;
    if (typeof IntersectionObserver === "undefined") return;

    const order = key.split(",").filter(Boolean);
    const nodes = order
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);
    if (nodes.length === 0) return;

    // 見ている位置＝題字帯のすぐ下の 1 本の線。その線を含む節が現在地。
    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => visible.set(entry.target.id, entry.isIntersecting));

        const top = order.find((id) => visible.get(id));
        if (top !== undefined) {
          setActiveId((prev) => (prev === top ? prev : top));
          return;
        }

        // 交差が無いのは、線の下が余白か、いちばん下まで来たとき。
        const above = nodes.filter((node) => node.getBoundingClientRect().top <= headerHeight);
        const last = above.length > 0 ? above[above.length - 1].id : null;
        setActiveId((prev) => (prev === last ? prev : last));
      },
      { rootMargin: `-${headerHeight}px 0px 0px 0px`, threshold: 0 },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [headerHeight, key]);

  return activeId;
}
