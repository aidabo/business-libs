/**
 * Reference story examples — used as demo data in page builder components.
 * Extracted from apps/host/src/services/personStory/personStoryReferenceExamples.ts
 */

export type PersonStoryReferenceExample = {
  id: string;
  title: string;
  subject: string;
  galleryPath: string;
  language: "zh" | "ja";
  summary: string;
  chapterCount: number;
  volumeCount: number;
  timeSpan: string;
  geography: string;
  sourcePath: string;
  timelineHtml: string;
  themes: string[];
  structuralNotes: string[];
};

export type PersonStoryStructureOutlineItem = {
  title: string;
  description: string;
  kind: "intro" | "timeline" | "volume" | "supplement" | "afterword";
  chapterCount?: number;
};

export const PERSON_STORY_REFERENCE_EXAMPLES: PersonStoryReferenceExample[] = [
  {
    id: "lin-zhiyuan",
    title: "海的那一边",
    subject: "林志远",
    galleryPath: "person-galleries/lin-zhiyuan",
    language: "zh",
    summary: "草根逆袭型跨国企业家传记，横跨闽南、香港、东京、拉各斯、布宜诺斯艾利斯与厦门，强调出走、创业、家庭和解与归途。",
    chapterCount: 109,
    volumeCount: 4,
    timeSpan: "1950—2025",
    geography: "福建围头 → 香港 → 东京 → 尼日利亚 → 阿根廷 → 厦门",
    sourcePath: "source/01-lin-zhiyuan.md",
    timelineHtml: "timeline/timeline-lin.html",
    themes: ["出走与归来", "一期一会", "草根成长", "跨国创业", "家庭和解"],
    structuralNotes: [
      "以卷为主骨架，时间线清晰，适合 chapter / episode 连载化。",
      "补充章与扩充篇章承担人物侧面、家庭视角与危机段落。",
      "同一人物可拆成主线章节 + 延伸章节两层结构。",
    ],
  },
  {
    id: "yamada-sakura",
    title: "桜と薔薇",
    subject: "山田桜",
    galleryPath: "person-galleries/yamada-sakura",
    language: "ja",
    summary: "女性突破型跨国经营传记，从神户、剑桥、深圳到杜塞尔多夫和上海，强调玻璃天花板、局外人视角与和解。",
    chapterCount: 124,
    volumeCount: 5,
    timeSpan: "1962—2025",
    geography: "神户 → 东京 → 剑桥 → 深圳 → 杜塞尔多夫 → 上海 → 京都",
    sourcePath: "source/jp/sakura-yamada-jp.md",
    timelineHtml: "timeline/timeline-sakura.html",
    themes: ["女性活躍", "異文化適応", "国際経営", "家族と仕事", "自己実現"],
    structuralNotes: [
      "時系列順の巻構成で、章ごとに視点が切り替わる。",
      "実在の女性経営者をモデルにしたオムニバス形式。",
      "時代背景と個人の成長を交錯させる構成。",
    ],
  },
];

export function getPersonStoryReferenceExamples(): PersonStoryReferenceExample[] {
  return PERSON_STORY_REFERENCE_EXAMPLES;
}

export function selectPersonStoryReferenceExample(
  query?: string,
): PersonStoryReferenceExample | null {
  const value = String(query || "").trim().toLowerCase();
  if (!value) return null;
  return (
    PERSON_STORY_REFERENCE_EXAMPLES.find(
      (ref) =>
        ref.title.toLowerCase().includes(value) ||
        ref.subject.toLowerCase().includes(value) ||
        ref.id.toLowerCase().includes(value),
    ) || null
  );
}

export function buildPersonStoryStructureOutlineFromReference(
  reference: PersonStoryReferenceExample,
): PersonStoryStructureOutlineItem[] {
  const outline: PersonStoryStructureOutlineItem[] = [
    {
      title: reference.subject,
      description: reference.summary,
      kind: "intro",
    },
    {
      title: "Timeline",
      description: `${reference.timeSpan} · ${reference.geography}`,
      kind: "timeline",
    },
    ...Array.from({ length: reference.volumeCount }, (_, i) => ({
      title: `Volume ${String(i + 1).padStart(2, "0")}`,
      description: `Chapters covering key milestones`,
      chapterCount: Math.ceil(reference.chapterCount / reference.volumeCount),
      kind: "volume" as const,
    })),
    {
      title: "Supplement",
      description: "Background, family perspective, and crisis sections.",
      kind: "supplement",
    },
    {
      title: "Afterword",
      description: "Reflections and closure.",
      kind: "afterword",
    },
  ];
  return outline;
}
