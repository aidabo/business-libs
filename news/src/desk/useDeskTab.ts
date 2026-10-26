import { useEffect, useState } from "react";
import { DESK_TABS, tabFromSearch, type DeskTabId } from "./model";

const IDS = DESK_TABS.map((tab) => tab.id) as string[];

/**
 * いま見ているタブ。固定ページ（/dashboard/news）では `?tab=` で持ち、再読み込みしても
 * 元のタブに戻る（spec §4.0 A5③）。Page Builder で同じページに机を複数置くときは
 * `syncUrl: false` にする（URL を取り合わない）。
 *
 * `useSearchParams()` は使わない — Suspense の外で使うと静的な殻を描けず、
 * ビルドが CSR bailout で失敗する。マウント後に window.location から読む。
 */
export default function useDeskTab({
  initial = "paper",
  allowed = IDS as DeskTabId[],
  syncUrl = true,
}: {
  initial?: DeskTabId;
  allowed?: readonly DeskTabId[];
  syncUrl?: boolean;
} = {}): [DeskTabId, (id: DeskTabId) => void] {
  const first = allowed.includes(initial) ? initial : allowed[0] ?? "paper";
  const [tab, setTab] = useState<DeskTabId>(first);

  useEffect(() => {
    if (!syncUrl) return;
    const wanted = tabFromSearch(window.location.search, allowed as string[]);
    if (wanted) setTab(wanted as DeskTabId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncUrl]);

  const select = (id: DeskTabId) => {
    if (!allowed.includes(id)) return;
    setTab(id);
    if (!syncUrl) return;
    const url = new URL(window.location.href);
    if (id === first) url.searchParams.delete("tab");
    else url.searchParams.set("tab", id);
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  };

  return [tab, select];
}
