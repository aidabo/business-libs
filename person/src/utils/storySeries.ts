/**
 * Pure utility functions for person story presentation.
 * Extracted from apps/host/src/templates/author/storySeries.ts
 * — no React / Next.js dependencies.
 */

export type StoryEpisode = {
  id: number | string;
  title: string;
  excerpt?: string;
  published_at?: string;
};

export type StorySubject = {
  authorSlug?: string | null;
  type?: string | null;
  name?: string;
};

export type StoryEpisodeSection = {
  title: string;
  description: string;
  episodes: StoryEpisode[];
};

export type LifeEvent = {
  year: number;
  title: string;
  description: string;
};

function sortByPublishedAtDesc(episodes: StoryEpisode[]) {
  return [...episodes].sort((a, b) => {
    const timeA = a.published_at ? new Date(a.published_at).getTime() : 0;
    const timeB = b.published_at ? new Date(b.published_at).getTime() : 0;
    return timeB - timeA;
  });
}

export function getEpisodeStageLabel(index: number, total: number) {
  if (total <= 1) return "单篇";
  if (index === 0) return "开篇";
  if (index === total - 1) return "收束";
  if (index === 1) return "展开";
  return "转折";
}

export function getLifeEventPhaseLabel(index: number, total: number) {
  if (total <= 1) return "节点";
  if (index === 0) return "起点";
  if (index === total - 1) return "回归";
  if (index === 1) return "转场";
  return "沉淀";
}

export function getRelationLabel(
  index: number,
  subject?: StorySubject | null,
) {
  if (subject?.type === "fictional") {
    return index === 0 ? "主角同伴" : index === 1 ? "叙事支线" : "关联人物";
  }
  if (subject?.authorSlug) {
    return index === 0 ? "核心关系" : index === 1 ? "并行视角" : "延伸人物";
  }
  return index === 0 ? "相关人物" : index === 1 ? "相似经历" : "延伸关系";
}

export function getStorySubjectLabel(subject?: StorySubject | null) {
  if (subject?.type === "fictional") return "神话人物";
  if (subject?.authorSlug) return "作者人物";
  return "人物主角";
}

export function buildStoryEpisodeSections(
  episodes: StoryEpisode[] = [],
  subject?: StorySubject | null,
) {
  const sorted = sortByPublishedAtDesc(episodes);
  if (sorted.length === 0) return [];

  const hasAuthorRole = Boolean(subject?.authorSlug);
  const primaryCount = sorted.length >= 4 ? 3 : sorted.length;
  const primaryEpisodes = sorted.slice(0, primaryCount);
  const secondaryEpisodes = sorted.slice(primaryCount);
  const primaryTitle = hasAuthorRole ? "主线章节" : "人物主线";
  const primaryDescription = hasAuthorRole
    ? "从作者视角串起的核心章节，适合先按顺序阅读。"
    : "从人物视角串起的核心章节，适合先按顺序阅读。";
  const secondaryTitle = hasAuthorRole ? "延伸篇章" : "补充视角";
  const secondaryDescription = hasAuthorRole
    ? "把写作经验、生活经验和延伸故事再展开看。"
    : "把人物经历、旁支故事和相关背景补充完整。";

  const sections: StoryEpisodeSection[] = [
    { title: primaryTitle, description: primaryDescription, episodes: primaryEpisodes },
  ];

  if (secondaryEpisodes.length > 0) {
    sections.push({ title: secondaryTitle, description: secondaryDescription, episodes: secondaryEpisodes });
  }

  return sections;
}

export function sortLifeEvents(lifeEvents: LifeEvent[] = []) {
  return [...lifeEvents].sort((a, b) => a.year - b.year);
}
