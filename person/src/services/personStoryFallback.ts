/**
 * Person story fallback data layer — resolves person records from sample data.
 * Extracted from apps/host/src/services/personStory/personStoryFallback.ts
 */

import { authors, people, posts, type PersonRecord } from "../data/persons";
import { buildStoryEpisodeSections, getStorySubjectLabel } from "../utils/storySeries";
import { getCanonicalPersonHref } from "../utils/routeAdapters";
import type {
  PersonStoryCatalogItem,
  PersonStoryEpisode,
  PersonStorySnapshot,
  PersonStorySubjectType,
} from "../types/personStory";

const PERSON_RECORDS: PersonRecord[] = [...authors, ...people];

export const getPersonStorySubjectType = (
  person?: { type?: string | null } | null,
): PersonStorySubjectType => {
  const normalized = String(person?.type || "").trim().toLowerCase();
  if (normalized === "fictional") return "fictional";
  if (normalized === "real") return "real";
  return "unknown";
};

export const findPersonBySlug = (slug: string | undefined | null): PersonRecord | null => {
  if (!slug) return null;
  return PERSON_RECORDS.find(
    (person) => person.authorSlug === slug || person.slug === slug,
  ) ?? null;
};

export const findPersonById = (id: string | undefined | null): PersonRecord | null => {
  if (id == null) return null;
  return PERSON_RECORDS.find((person) => String(person.id) === String(id)) ?? null;
};

export const resolvePersonRecord = (identifier?: string | null): PersonRecord | null => {
  const value = String(identifier || "").trim();
  if (!value) return null;
  return (
    findPersonBySlug(value) ||
    findPersonById(value) ||
    PERSON_RECORDS.find((person) => String(person.authorSlug || "").trim() === value) ||
    null
  );
};

export const findPersonRecordByQuery = (query?: string | null): PersonRecord | null => {
  const value = String(query || "").trim().toLowerCase();
  if (!value) return null;
  return (
    PERSON_RECORDS.find((person) => {
      const haystack = [
        person?.name,
        person?.slug,
        person?.authorSlug,
        person?.title,
        person?.bio,
      ]
        .map((item) => String(item || "").trim().toLowerCase())
        .join(" | ");
      return haystack.includes(value);
    }) || null
  );
};

export const toPersonStoryCatalogItem = (
  person: any,
  overrides?: Partial<PersonStoryCatalogItem>,
): PersonStoryCatalogItem => {
  const canonicalHref = getCanonicalPersonHref(person);
  const hasAuthorRole = Boolean(person?.authorSlug);
  const type = getPersonStorySubjectType(person);
  return {
    id: person?.id,
    name: String(person?.name || "Unnamed").trim(),
    slug: typeof person?.slug === "string" ? person.slug.trim() || null : null,
    authorSlug: typeof person?.authorSlug === "string" ? person.authorSlug.trim() || null : null,
    title: typeof person?.title === "string" ? person.title.trim() || null : null,
    avatar: typeof person?.avatar === "string" ? person.avatar.trim() || null : null,
    bio: typeof person?.bio === "string" ? person.bio.trim() || null : null,
    popularity: Number(person?.popularity ?? 0) || 0,
    storyCount: Number(person?.storyCount ?? 0) || 0,
    type,
    hasAuthorRole,
    subjectLabel: getStorySubjectLabel({ authorSlug: hasAuthorRole ? "present" : null, type }),
    canonicalHref,
    ...overrides,
  };
};

export const buildPersonStoryCatalog = () =>
  [...PERSON_RECORDS]
    .map((person) => toPersonStoryCatalogItem(person))
    .sort((a, b) => b.popularity - a.popularity || b.storyCount - a.storyCount);

export const buildPersonStoryEpisodes = (
  person: any,
): PersonStoryEpisode[] => {
  if (!person?.id) return [];
  return [...posts]
    .filter((post) => String(post.personId) === String(person.id))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((post) => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      published_at: post.date,
    }));
};

export const buildPersonStorySnapshot = (
  person: any,
  options?: {
    recentPosts?: PersonStoryEpisode[];
    source?: PersonStorySnapshot["source"];
    relatedPeople?: PersonStoryCatalogItem[];
  },
): PersonStorySnapshot => {
  const subject = toPersonStoryCatalogItem(person);
  const recentPosts = options?.recentPosts ?? buildPersonStoryEpisodes(person);
  const relatedPeople =
    options?.relatedPeople ??
    buildPersonStoryCatalog()
      .filter((item) => item.id !== subject.id)
      .slice(0, 3);
  const storySections = buildStoryEpisodeSections(recentPosts, {
    authorSlug: subject.hasAuthorRole ? subject.authorSlug : null,
    type: subject.type,
    name: subject.name,
  });

  return {
    subject,
    source: options?.source || "sample",
    lifeEvents: Array.isArray(person?.lifeEvents) ? person.lifeEvents : [],
    relatedPeople,
    recentPosts,
    storySections,
  };
};
