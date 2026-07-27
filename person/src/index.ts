/**
 * Person business component package.
 *
 * Person/character/legend/timeline UI components for the page builder.
 * Covers two visual modes: real (historical/author) and fictional (legend/character).
 */

import { PersonProvider } from "./contexts/PersonContext";

// ── Components ──
export { default as AuthorLifeTimeline } from "./components/AuthorLifeTimeline";
export { default as AuthorEpisodeList } from "./components/AuthorEpisodeList";
export { default as AuthorRelationTile } from "./components/AuthorRelationTile";
export { default as PersonCard } from "./components/PersonCard";
export { default as PersonStoryTimelinePreview } from "./components/PersonStoryTimelinePreview";
export { default as PersonEpisodeLinkList } from "./components/PersonEpisodeLinkList";
export { default as PersonStoryTimelineBlock } from "./components/PersonStoryTimelineBlock";
export { default as PersonStoryRelationBlock } from "./components/PersonStoryRelationBlock";
export { default as PersonStoryEpisodeLaneBlock } from "./components/PersonStoryEpisodeLaneBlock";
export { default as PersonStoryTimelineHtmlBlock } from "./components/PersonStoryTimelineHtmlBlock";

// ── Data ──
export {
  getPersonStoryReferenceExamples,
  selectPersonStoryReferenceExample,
  buildPersonStoryStructureOutlineFromReference,
  PERSON_STORY_REFERENCE_EXAMPLES,
} from "./data/referenceExamples";
export { authors, people, posts } from "./data/persons";

// ── Utils ──
export {
  getEpisodeStageLabel,
  getLifeEventPhaseLabel,
  getRelationLabel,
  getStorySubjectLabel,
  buildStoryEpisodeSections,
  sortLifeEvents,
} from "./utils/storySeries";
export {
  getCanonicalPersonSlug,
  getCanonicalPersonHref,
  getCanonicalAuthorSlug,
  getCanonicalAuthorHref,
} from "./utils/routeAdapters";

// ── Services ──
export {
  fetchPersonGraphCatalog,
  fetchPersonGraphSnapshot,
} from "./services/personGraphApi";
export {
  getPersonStorySubjectType,
  findPersonBySlug,
  findPersonById,
  resolvePersonRecord,
  findPersonRecordByQuery,
  toPersonStoryCatalogItem,
  buildPersonStoryCatalog,
  buildPersonStoryEpisodes,
  buildPersonStorySnapshot,
} from "./services/personStoryFallback";
export {
  mapGhostUserToPersonStoryItem,
  mapGhostPostsToPersonStoryEpisodes,
  mapPersonGraphPersonToPersonStoryItem,
  mapPersonGraphSnapshotToPersonStorySnapshot,
} from "./services/personStoryMappers";

// ── Component registry (for ComponentsProvider) ──
import AuthorLifeTimeline from "./components/AuthorLifeTimeline";
import AuthorEpisodeList from "./components/AuthorEpisodeList";
import AuthorRelationTile from "./components/AuthorRelationTile";
import PersonCard from "./components/PersonCard";
import PersonStoryTimelinePreview from "./components/PersonStoryTimelinePreview";
import PersonEpisodeLinkList from "./components/PersonEpisodeLinkList";
import PersonStoryTimelineBlock from "./components/PersonStoryTimelineBlock";
import PersonStoryRelationBlock from "./components/PersonStoryRelationBlock";
import PersonStoryEpisodeLaneBlock from "./components/PersonStoryEpisodeLaneBlock";
import PersonStoryTimelineHtmlBlock from "./components/PersonStoryTimelineHtmlBlock";

export const PersonComponents = {
  PersonProvider,
  AuthorLifeTimeline,
  AuthorEpisodeList,
  AuthorRelationTile,
  PersonCard,
  PersonStoryTimelinePreview,
  PersonEpisodeLinkList,
  PersonStoryTimelineBlock,
  PersonStoryRelationBlock,
  PersonStoryEpisodeLaneBlock,
  PersonStoryTimelineHtmlBlock,
};

// ── Default props registry (for ComponentsProvider) ──
export const PersonDefaultProps = {
  AuthorLifeTimeline: {
    title: "人物年表",
    description: "重要人生节点与事件",
    lifeEvents: [
      { year: 1962, title: "出生", description: "福建省泉州市" },
      { year: 1985, title: "大学毕业", description: "厦门大学经济系" },
      { year: 1992, title: "首次创业", description: "创办进出口贸易公司" },
    ],
    emptyText: "暂无年表数据。",
    subjectType: "real",
  },
  AuthorEpisodeList: {
    title: "连载章节",
    description: "故事章节列表",
    episodes: [
      { id: "ep-1", title: "第一章: 启程", excerpt: "故事从这里开始...", published_at: "2024-01" },
      { id: "ep-2", title: "第二章: 转折", excerpt: "命运的转折点...", published_at: "2024-02" },
    ],
    emptyText: "暂无连载故事。",
    subjectType: "real",
  },
  AuthorRelationTile: {
    id: "rel-1",
    name: "关联人物示例",
    title: "示例头衔",
    storyCount: 3,
    relationLabel: "核心关系",
    subjectType: "real",
  },
  PersonCard: {
    person: {
      id: 1,
      name: "示例人物",
      slug: "example-person",
      title: "示例头衔",
      avatar: "",
      bio: "这是一位示例人物。",
      storyCount: 5,
      popularity: 80,
      type: "real",
    },
  },
  PersonStoryTimelinePreview: {
    reference: {
      id: "yamada-sakura",
      title: "桜と薔薇",
      subject: "山田桜",
      galleryPath: "person-galleries/yamada-sakura",
      language: "ja" as const,
      summary: "女性突破型跨国经营传记",
      chapterCount: 124,
      volumeCount: 5,
      timeSpan: "1962—2025",
      geography: "神戸 → 東京 → 深圳 → 上海",
      sourcePath: "source/jp/sakura-yamada-jp.md",
      timelineHtml: "timeline/timeline-sakura.html",
      themes: ["女性活躍", "異文化適応"],
      structuralNotes: ["時系列順の巻構成"],
    },
    references: [],
    structureOutline: [],
  },
  PersonEpisodeLinkList: {
    slug: "example-slug",
    subject: "示例人物",
  },
  PersonStoryTimelineBlock: {
    referenceId: "yamada-sakura",
    query: "",
    compact: false,
    _componentDesc: 'component.personStoryTimelineBlock.desc',
    __schema: {
      type: "object",
      title: "PersonStoryTimelineBlock",
      properties: {
        referenceId: {
          type: "string",
          title: "Reference Id",
          description:
            "Use one of the registered reference works, e.g. yamada-sakura or lin-zhiyuan.",
        },
        query: {
          type: "string",
          title: "Query",
          description: "Optional query to auto-select the reference example.",
        },
        compact: {
          type: "boolean",
          title: "Compact",
          description:
            "Render the timeline preview in a narrower, page-builder-friendly width.",
        },
      },
    },
  },
  PersonStoryEpisodeLaneBlock: {
    referenceId: "lin-zhiyuan",
    query: "",
    compact: false,
    _componentDesc: 'component.personStoryEpisodeLaneBlock.desc',
    __schema: {
      type: "object",
      title: "PersonStoryEpisodeLaneBlock",
      properties: {
        referenceId: {
          type: "string",
          title: "Reference Id",
          description:
            "Use a registered reference work id such as lin-zhiyuan or yamada-sakura.",
        },
        query: {
          type: "string",
          title: "Query",
          description: "Optional query used to auto-select the reference work.",
        },
        compact: {
          type: "boolean",
          title: "Compact",
          description:
            "Render the block with a narrower width for StackPage layouts.",
        },
      },
    },
  },
  PersonStoryRelationBlock: {
    referenceId: "yamada-sakura",
    query: "",
    compact: false,
    _componentDesc: 'component.personStoryRelationBlock.desc',
    __schema: {
      type: "object",
      title: "PersonStoryRelationBlock",
      properties: {
        referenceId: {
          type: "string",
          title: "Reference Id",
          description:
            "Use a registered reference work id such as yamada-sakura or lin-zhiyuan.",
        },
        query: {
          type: "string",
          title: "Query",
          description: "Optional query used to auto-select the reference work.",
        },
        compact: {
          type: "boolean",
          title: "Compact",
          description:
            "Render the block with a narrower width for StackPage layouts.",
        },
      },
    },
  },
  PersonStoryTimelineHtmlBlock: {
    referenceId: "yamada-sakura",
    query: "",
    timelineHtml: "",
    timelineHtmlPath: "timeline/timeline-sakura.html",
    compact: false,
    _componentDesc: 'component.personStoryTimelineHtmlBlock.desc',
    __schema: {
      type: "object",
      title: "PersonStoryTimelineHtmlBlock",
      properties: {
        referenceId: {
          type: "string",
          title: "Reference Id",
          description:
            "Use a registered story id such as yamada-sakura or lin-zhiyuan.",
        },
        query: {
          type: "string",
          title: "Query",
          description: "Optional query used to auto-select the story.",
        },
        timelineHtml: {
          type: "string",
          title: "Timeline HTML",
          description: "Optional raw HTML to render directly in the block.",
        },
        timelineHtmlPath: {
          type: "string",
          title: "Timeline HTML Path",
          description:
            "Gallery-relative timeline HTML path for registry-backed stories.",
        },
        compact: {
          type: "boolean",
          title: "Compact",
          description:
            "Render the block with a narrower width for StackPage layouts.",
        },
      },
    },
  },
};

export { PersonProvider };

// ── Context ──
export { usePersonContext, useT } from "./contexts/PersonContext";
export type { TranslateFn } from "./contexts/PersonContext";

// ── Types ──
export type {
  PersonStorySubjectType,
  PersonStoryCatalogItem,
  PersonStoryEpisode,
  PersonStorySnapshot,
} from "./types/personStory";
export type {
  PersonStoryReferenceExample,
  PersonStoryStructureOutlineItem,
} from "./data/referenceExamples";
export type { PersonLike } from "./utils/routeAdapters";
export type {
  StoryEpisode,
  StorySubject,
  StoryEpisodeSection,
  LifeEvent,
} from "./utils/storySeries";
export type { PersonRecord, PersonPostRecord } from "./data/persons";
