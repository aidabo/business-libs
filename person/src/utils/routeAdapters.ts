/**
 * Pure URL/route adapter functions for person navigation.
 * Extracted from apps/host/src/templates/home/homeRouteAdapters.ts
 * — no React / Next.js dependencies.
 */

export type PersonLike = {
  authorSlug?: string | null;
  slug?: string | null;
};

export function getCanonicalPersonSlug(person?: PersonLike | null): string | null {
  const slug = person?.slug ?? person?.authorSlug ?? null;
  if (typeof slug !== "string") return null;
  const trimmed = slug.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getCanonicalPersonHref(person?: PersonLike | string | null): string | null {
  if (typeof person === "string") {
    const trimmed = person.trim();
    return trimmed ? `/person/${encodeURIComponent(trimmed)}` : null;
  }
  const slug = getCanonicalPersonSlug(person);
  return slug ? `/person/${encodeURIComponent(slug)}` : null;
}

export function getCanonicalAuthorSlug(person?: PersonLike | null): string | null {
  const slug = person?.authorSlug ?? person?.slug ?? null;
  if (typeof slug !== "string") return null;
  const trimmed = slug.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getCanonicalAuthorHref(person?: PersonLike | null): string | null {
  const slug = getCanonicalAuthorSlug(person);
  return slug ? `/author/${encodeURIComponent(slug)}` : null;
}
