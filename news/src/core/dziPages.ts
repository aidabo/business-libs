/**
 * DZI job `pages` normalization.
 *
 * The Ghost `social_ai_dzi_jobs` browse/read endpoints return `pages` as a raw
 * JSON *string* (the bookshelf model stores it as text and is not parsed on
 * read), whereas the claim/complete/progress endpoints run it through
 * `serializeRow` and return an already-parsed array. Frontend mappers must run
 * the raw value through this helper so both shapes yield a page array — reading
 * `Array.isArray(row.pages)` alone silently drops every page for the browse/read
 * paths the UI actually uses (viewer, jobs list, agent panels).
 */

export interface DziPage {
  pageNum: number;
  width: number;
  height: number;
  dziUrl: string;
}

/** Coerce a raw job `pages` value (array | JSON string | null) into a page array. */
export function coerceDziPages(raw: unknown): DziPage[] {
  let value: unknown = raw;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      value = JSON.parse(trimmed);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(value)) return [];

  return value.map((p: any) => ({
    pageNum: p?.pageNum ?? p?.page_num ?? 0,
    width: p?.width ?? 0,
    height: p?.height ?? 0,
    dziUrl: p?.dziUrl ?? p?.dzi_url ?? "",
  }));
}

/**
 * Derive a preview thumbnail URL from a page's DZI descriptor.
 *
 * A Deep Zoom pyramid always contains a level small enough to hold the whole
 * page in a single tile — that tile (`…/page-N_files/{level}/0_0.jpeg`) is a
 * ready-made thumbnail the tiles route already serves in both filesystem and
 * S3 modes. The jobs list uses this when a job has no stored `preview_url`,
 * so completed jobs never fall back to a blank/black placeholder.
 *
 * @param page      first page of the job (needs `dziUrl` + pixel `width`/`height`)
 * @param tileSize  DZI tile size (worker default 256 — see DEEPZOOM_TILE_SIZE)
 * @param ext       tile image extension (sharp's dz layout emits `jpeg`)
 * @returns the single-tile thumbnail URL, or "" when it can't be derived
 */
export function dziThumbnailUrl(
  page: Pick<DziPage, "dziUrl" | "width" | "height"> | undefined | null,
  tileSize = 256,
  ext = "jpeg",
): string {
  const dziUrl = String(page?.dziUrl || "").trim();
  const width = Number(page?.width) || 0;
  const height = Number(page?.height) || 0;
  if (!dziUrl || width <= 0 || height <= 0) return "";
  if (!/page-\d+\.dzi$/i.test(dziUrl)) return "";

  const maxDim = Math.max(width, height);
  // DZI max level = ceil(log2(longest edge)); the highest level whose scaled
  // image still fits in one tile is maxLevel - ceil(log2(maxDim / tileSize)).
  const maxLevel = Math.ceil(Math.log2(Math.max(2, maxDim)));
  const shrink = Math.max(0, Math.ceil(Math.log2(maxDim / tileSize)));
  const thumbLevel = Math.max(0, maxLevel - shrink);

  return dziUrl.replace(
    /page-(\d+)\.dzi$/i,
    (_m, n) => `page-${n}_files/${thumbLevel}/0_0.${ext}`,
  );
}
