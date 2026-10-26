import { DEFAULT_PAPER_SETTINGS, type PaperSettings } from "../core";
import { useNews } from "../adapter/NewsContext";

// 紙名・版号の基準。値の出所はホスト（実行時の NEWS_* 設定）なので、ホストが
// adapter.usePaperSettings で渡す。無ければ既定値（試験・プレビュー）。
//
// 部品は Page Builder で 1 個ずつ NewsProvider に包まれる。adapter はホストが
// 1 つだけ作って全部に渡すので、どの部品から呼んでも同じ値になる。
const useDefaultPaperSettings = (): PaperSettings => DEFAULT_PAPER_SETTINGS;

export function usePaperSettings(): PaperSettings {
  const { adapter } = useNews();
  const useHostSettings = adapter.usePaperSettings ?? useDefaultPaperSettings;
  return useHostSettings();
}
