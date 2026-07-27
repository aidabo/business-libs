/**
 * Person story mappers — convert Ghost/Graph API responses to story types.
 * Extracted from apps/host/src/services/personStory/personStoryMappers.ts
 */

import { buildStoryEpisodeSections, getStorySubjectLabel } from "../utils/storySeries";
import { getCanonicalPersonHref } from "../utils/routeAdapters";
import {
  resolvePersonRecord,
  toPersonStoryCatalogItem,
} from "./personStoryFallback";
import type {
  PersonStoryCatalogItem,
  PersonStoryEpisode,
  PersonStorySnapshot,
} from "../types/personStory";

const parseGraphYear = (value?: string | null) => {
  if (!value) return 0;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 0;
  return date.getFullYear();
};

const mapSubjectType = (value?: string | null): PersonStoryCatalogItem["type"] => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "real" || normalized === "person" || normalized === "author") {
    return "real";
  }
  if (normalized === "fictional" || normalized === "legend" || normalized === "character") {
    return "fictional";
  }
  return "unknown";
};

export const mapGhostUserToPersonStoryItem = (
  user: any,
  fallback?: PersonStoryCatalogItem | null,
): PersonStoryCatalogItem => {
  const base = fallback || toPersonStoryCatalogItem(user);
  const merged = {
    ...base,
    id: user?.id ?? base.id,
    name: String(user?.name || base.name || "Unnamed").trim(),
    title: typeof user?.title === "string" ? user.title.trim() || base.title : base.title,
    avatar: typeof user?.profile_image === "string" ? user.profile_image.trim() || base.avatar : base.avatar,
    bio: typeof user?.bio === "string" ? user.bio.trim() || base.bio : base.bio,
    storyCount: Number(user?.count?.posts ?? base.storyCount ?? 0) || 0,
    subjectLabel: base.subjectLabel,
    canonicalHref: getCanonicalPersonHref(base.slug || base.authorSlug || null),
    type: mapSubjectType(base.type),
  };
  return merged;
};

export const mapGhostPostsToPersonStoryEpisodes = (
  posts: any[] = [],
): PersonStoryEpisode[] =>
  posts
    .filter(Boolean)
    .map((post) => ({
      id: post?.id,
      title: String(post?.title || "Untitled").trim(),
      excerpt: String(post?.custom_excerpt || post?.excerpt || "").trim() || undefined,
      published_at:
        typeof post?.published_at === "string"
          ? post.published_at
          : typeof post?.date === "string"
            ? post.date
            : undefined,
    }))
    .filter((post) => Boolean(post.id));

export const mapPersonGraphPersonToPersonStoryItem = (
  person: any,
  fallback?: PersonStoryCatalogItem | null,
): PersonStoryCatalogItem => {
  const base = fallback || toPersonStoryCatalogItem(person);
  const slug = String(person?.slug || base.slug || "").trim() || null;
  const authorSlug =
    String(person?.authorSlug || person?.author_slug || base.authorSlug || "").trim() || null;
  const name = String(person?.display_name || person?.name || base.name || "Unnamed").trim();
  const title = String(person?.title || base.title || "").trim() || null;
  const avatar = String(person?.avatar || person?.profile_image || base.avatar || "").trim() || null;
  const bio = String(person?.bio_summary || person?.bio || base.bio || "").trim() || null;
  const type = mapSubjectType(person?.subject_type || person?.type || base.type);
  const hasAuthorRole = Boolean(authorSlug);

  return {
    ...base,
    id: person?.id ?? base.id,
    name,
    slug,
    authorSlug,
    title,
    avatar,
    bio,
    popularity: Number(person?.popularity ?? base.popularity ?? 0) || 0,
    storyCount: Number(person?.story_count ?? person?.storyCount ?? base.storyCount ?? 0) || 0,
    type,
    hasAuthorRole,
    subjectLabel: getStorySubjectLabel({ authorSlug: hasAuthorRole ? "present" : null, type }),
    canonicalHref: getCanonicalPersonHref(slug || authorSlug || null),
  };
};

const mapPersonGraphRelationToCatalogItem = (relation: any): PersonStoryCatalogItem => {
  const relatedPerson = relation?.relatedPerson || relation?.related_person || null;
  const fallbackRecord = resolvePersonRecord(
    relatedPerson?.slug || relatedPerson?.authorSlug || relatedPerson?.author_slug || relation?.related_person_id || null,
  );
  const base = fallbackRecord ? toPersonStoryCatalogItem(fallbackRecord) : null;
  const item = mapPersonGraphPersonToPersonStoryItem(
    relatedPerson || {
      id: relation?.related_person_id || relation?.id || relation?.relation_key,
      name: relation?.relation_label || relation?.relation_key || "Related person",
      display_name: relation?.relation_label || relation?.relation_key || "Related person",
      subject_type: "unknown",
    },
    base,
  );
  return {
    ...item,
    id: item.id || relation?.related_person_id || relation?.id || relation?.relation_key,
    name: item.name || relation?.relation_label || relation?.relation_key || "Related person",
    title: item.title || relation?.relation_label || relation?.relation_key || null,
  };
};

export const mapPersonGraphSnapshotToPersonStorySnapshot = (
  graph: any,
  fallback?: PersonStoryCatalogItem | null,
): PersonStorySnapshot => {
  const fallbackRecord = fallback || resolvePersonRecord(graph?.person?.slug || graph?.person?.id || null);
  const subject = mapPersonGraphPersonToPersonStoryItem(
    graph?.person,
    fallbackRecord ? toPersonStoryCatalogItem(fallbackRecord) : null,
  );
  const storySeries = Array.isArray(graph?.storySeries) ? graph.storySeries : [];
  const recentPosts = storySeries
    .flatMap((series: any) =>
      Array.isArray(series?.episodes)
        ? series.episodes.map((episode: any) => ({
            id: episode?.post_id || episode?.id,
            episodeId: episode?.id,
            title: String(episode?.title || "Untitled").trim(),
            excerpt: String(episode?.summary || episode?.excerpt || "").trim() || undefined,
            published_at: typeof episode?.published_at === "string" ? episode.published_at : undefined,
          }))
        : [],
    )
    .filter((episode: PersonStoryEpisode) => Boolean(episode.id))
    .sort((a: PersonStoryEpisode, b: PersonStoryEpisode) => {
      const timeA = a.published_at ? new Date(a.published_at).getTime() : 0;
      const timeB = b.published_at ? new Date(b.published_at).getTime() : 0;
      return timeB - timeA;
    });
  const storySections =
    storySeries.length > 0
      ? storySeries
          .map((series: any) => {
            const episodes = Array.isArray(series?.episodes)
              ? series.episodes
                  .map((episode: any) => ({
                    id: episode?.post_id || episode?.id,
                    episodeId: episode?.id,
                    title: String(episode?.title || "Untitled").trim(),
                    excerpt: String(episode?.summary || episode?.excerpt || "").trim() || undefined,
                    published_at: typeof episode?.published_at === "string" ? episode.published_at : undefined,
                  }))
                  .filter((episode: PersonStoryEpisode) => Boolean(episode.id))
              : [];
            return {
              title: String(series?.title || "Series").trim(),
              description: String(series?.summary || "").trim() || undefined,
              episodes,
            };
          })
          .filter((section: { episodes: PersonStoryEpisode[] }) => section.episodes.length > 0)
      : buildStoryEpisodeSections(recentPosts, {
          authorSlug: subject.hasAuthorRole ? "present" : null,
          type: subject.type,
          name: subject.name,
        });
  const lifeEvents = Array.isArray(graph?.lifeEvents)
    ? graph.lifeEvents
        .map((event: any) => ({
          year: parseGraphYear(event?.happened_at),
          title: String(event?.title || "").trim(),
          description: [event?.description, event?.place]
            .map((value) => String(value || "").trim())
            .filter(Boolean)
            .join(" · "),
        }))
        .filter((event: { year: number; title: string }) => Boolean(event.year) || Boolean(event.title))
    : [];
  const relatedPeople = Array.isArray(graph?.relations)
    ? graph.relations.map((relation: any) => mapPersonGraphRelationToCatalogItem(relation))
    : [];

  return {
    subject,
    source: graph ? "ghost" : "sample",
    lifeEvents,
    relatedPeople,
    recentPosts,
    storySections,
  };
};
