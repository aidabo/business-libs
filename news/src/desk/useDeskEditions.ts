import { useEffect, useState } from "react";
import { toEdition, type DziEditions, type PaperEdition } from "../core";
import { ADMIN } from "./api";

/**
 * 机の電子紙面の棚。下書き（is_public=false）を含む完成ジョブ全部を、スタッフのセッションで読む。
 * 開く先はスタッフのビューア（下書きも開ける）。読めないときは空の棚（机の他の部分は動く）。
 */
export default function useDeskEditions(limit = 100): DziEditions {
  const [items, setItems] = useState<PaperEdition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(
          `${ADMIN}/social/ai/dzi/jobs/?limit=${limit}&order=created_at%20desc&filter=status:completed`,
          { credentials: "same-origin", cache: "no-store" },
        );
        if (!res.ok) return;
        const json = await res.json();
        const list: Record<string, unknown>[] = Array.isArray(json?.socialaidzijobs)
          ? (json.socialaidzijobs as unknown[]).flatMap((v) => (Array.isArray(v) ? v : [v])) as Record<string, unknown>[]
          : [];
        const editions = list
          .map((item) => toEdition(item ?? {}))
          .filter((item): item is PaperEdition => item !== null)
          .map((ed) => ({ ...ed, viewerUrl: `/jobs/deepzoom/viewer?jobId=${encodeURIComponent(ed.id)}` }));
        if (alive) setItems(editions);
      } finally {
        if (alive) setLoading(false);
      }
    })().catch(() => {});
    return () => {
      alive = false;
    };
  }, [limit]);

  return { items, loading, available: items.length > 0 };
}
