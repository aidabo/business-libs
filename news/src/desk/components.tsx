import Console, { type ConsoleProps } from "./Console";
import type { DeskTabId } from "./model";

// News Studio の編集局の部品（/dashboard/news を Page Builder で組むための単位）。
//
// どれも同じ机（Console）。読み（記事・タグ・素材・読み上げの印・電子紙面）は机の中で
// スタッフのセッションで行い、書き（記事の公開・予約・タグ）も机が持つ — データソースは
// 読み取り専用の約束なので、机は結び付けを使わない。スタッフでなければ何も出さない。
//
// イベント: タブを替えると news:desk:tab:changed { tab } を出し、news:desk:tab:select { tab }
// を受けるとタブを替える（別の部品のメニューから操作できる）。

type DeskProps = Pick<
  ConsoleProps,
  "readerHref" | "showNewArticle" | "tabChangedEvent" | "tabSelectEvent" | "__stackpage"
>;

/** 編集局まるごと（/dashboard/news と同じ）。 */
export function NewsDesk({
  initialTab = "paper",
  tabs,
  syncUrl = true,
  ...rest
}: DeskProps & { initialTab?: DeskTabId; tabs?: DeskTabId[]; syncUrl?: boolean }) {
  return <Console {...rest} initialTab={initialTab} tabs={tabs && tabs.length > 0 ? tabs : undefined} syncUrl={syncUrl} />;
}

/** 上の帯と今日の紙面の数字（公開・予約・下書き）だけ。 */
export function NewsDeskSummary(props: DeskProps) {
  return <Console {...props} showTabs={false} fullHeight={false} syncUrl={false} />;
}

const oneTab = (tab: DeskTabId) =>
  function NewsDeskTab(props: DeskProps) {
    return (
      <Console
        {...props}
        tabs={[tab]}
        initialTab={tab}
        showHeader={false}
        showMetrics={false}
        fullHeight={false}
        syncUrl={false}
      />
    );
  };

export const NewsDeskPaper = oneTab("paper");
export const NewsDeskArticles = oneTab("articles");
export const NewsDeskAssets = oneTab("assets");
export const NewsDeskReadAloud = oneTab("read");
export const NewsDeskBroadcast = oneTab("broadcast");
export const NewsDeskMediums = oneTab("mediums");
