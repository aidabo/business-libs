import { NEWS_EVENTS } from "../core";

// 編集局の部品の既定値。机はデータソースに結び付けない（読みも書きも机の中、スタッフのセッション）。

const TAB_IDS = ["paper", "articles", "assets", "read", "broadcast", "mediums"];
const text = (title: string) => ({ type: "string", title });
const schema = (title: string, properties: Record<string, unknown>) => ({ type: "object", title, properties });
const desc = (name: string) => `component.${name}.desc`;

const COMMON = {
  readerHref: "/home/news",
  showNewArticle: true,
  tabChangedEvent: NEWS_EVENTS.deskTabChanged,
  tabSelectEvent: NEWS_EVENTS.deskTabSelect,
};
const COMMON_SCHEMA = {
  readerHref: text("「読者面を見る」の行き先"),
  showNewArticle: { type: "boolean", title: "「新しく書く」を出す" },
  tabChangedEvent: { type: "string", title: "タブを替えたイベント", description: "{ tab }" },
  tabSelectEvent: { type: "string", title: "タブを替えるイベント（受ける）", description: "{ tab }" },
};

const oneTab = (name: string) => ({
  _componentDesc: desc(name),
  ...COMMON,
  __schema: schema(name, COMMON_SCHEMA),
});

export const NewsDeskDefaultProps: Record<string, Record<string, unknown>> = {
  NewsDesk: {
    _componentDesc: desc("NewsDesk"),
    ...COMMON,
    initialTab: "paper",
    tabs: [],
    syncUrl: true,
    __schema: schema("NewsDesk", {
      ...COMMON_SCHEMA,
      initialTab: { type: "string", title: "最初に開くタブ", enum: TAB_IDS },
      tabs: { type: "array", title: "出すタブ（空なら全部）", items: { type: "string", enum: TAB_IDS } },
      syncUrl: { type: "boolean", title: "今のタブを URL（?tab=）に持つ" },
    }),
  },
  NewsDeskSummary: oneTab("NewsDeskSummary"),
  NewsDeskPaper: oneTab("NewsDeskPaper"),
  NewsDeskArticles: oneTab("NewsDeskArticles"),
  NewsDeskAssets: oneTab("NewsDeskAssets"),
  NewsDeskReadAloud: oneTab("NewsDeskReadAloud"),
  NewsDeskBroadcast: oneTab("NewsDeskBroadcast"),
  NewsDeskMediums: oneTab("NewsDeskMediums"),
};
