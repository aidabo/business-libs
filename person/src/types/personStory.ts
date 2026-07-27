export type PersonStorySubjectType = "real" | "fictional" | "unknown";

export type PersonStoryCatalogItem = {
  id: number | string;
  name: string;
  slug: string | null;
  authorSlug: string | null;
  title: string | null;
  avatar: string | null;
  bio: string | null;
  popularity: number;
  storyCount: number;
  type: PersonStorySubjectType;
  hasAuthorRole: boolean;
  subjectLabel: string;
  canonicalHref: string | null;
};

export type PersonStoryEpisode = {
  id: number | string;
  episodeId?: number | string;
  title: string;
  excerpt?: string;
  published_at?: string;
};

export type PersonStorySnapshot = {
  subject: PersonStoryCatalogItem;
  source: "sample" | "ghost" | "hybrid";
  lifeEvents: Array<{
    year: number;
    title: string;
    description: string;
  }>;
  relatedPeople: PersonStoryCatalogItem[];
  recentPosts: PersonStoryEpisode[];
  storySections: Array<{
    title: string;
    description?: string;
    episodes: PersonStoryEpisode[];
  }>;
};
