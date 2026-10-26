/**
 * Desk links for DZI jobs — paper day and the medium/face Ghost tags.
 *
 * A newspaper scan is dated and owned: the desk picks the publication (medium
 * tag), the page (face tag) and the paper day (published_at). E-book scans
 * skip all three — every helper here degrades to "no desk links" so DeepZoom
 * stays a generic reader.
 *
 * Pure helpers only (no React): the agent form wires them, tests pin them.
 * Ghost-side contract: medium_id/face_id are tags.id of classification
 * "medium"/"face" tags; published_at mirrors posts.published_at (a nullable
 * dateTime that publish stamps to "now" when still unset).
 */

import { faceLabelOfTag, faceOrderOf } from "./faces";

export type MediumTagOption = { id: string; name: string };
export type FaceTagOption = { id: string; label: string };

/** Shape of one row from GET /api/tags (only the fields we read). */
type TagRow = { id?: unknown; name?: unknown };

const isTagRow = (value: unknown): value is TagRow =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

/**
 * Medium tags → select options for `publication_name`.
 *
 * Input is the raw `data` array of GET /api/tags?classification=medium; the
 * route already returns tags in `name asc` order, so options keep that order.
 * Only tags with both a non-empty id and name survive — a nameless option
 * would auto-fill an empty publication_name.
 */
export function mediumTagOptions(tags: unknown): MediumTagOption[] {
  if (!Array.isArray(tags)) return [];
  const seen = new Set<string>();
  const options: MediumTagOption[] = [];
  for (const tag of tags) {
    if (!isTagRow(tag)) continue;
    const id = String(tag.id ?? "").trim();
    const name = String(tag.name ?? "").trim();
    if (!id || !name || seen.has(id)) continue;
    seen.add(id);
    options.push({ id, name });
  }
  return options;
}

/**
 * Face tags → select options for `edition`.
 *
 * Labels come from faceLabelOfTag (the single source of the `#`/`面` internal
 * tag convention) and are deduped by label — two tags spelling the same face
 * would be indistinguishable in a select. Ordering follows FACE_ORDER so the
 * select reads like the paper; unknown faces sort after known ones by name.
 */
export function faceTagOptions(tags: unknown): FaceTagOption[] {
  if (!Array.isArray(tags)) return [];
  const idByLabel = new Map<string, string>();
  for (const tag of tags) {
    if (!isTagRow(tag)) continue;
    const id = String(tag.id ?? "").trim();
    const label = faceLabelOfTag(tag);
    if (!id || !label || idByLabel.has(label)) continue;
    idByLabel.set(label, id);
  }
  return [...idByLabel.entries()]
    .map(([label, id]) => ({ id, label }))
    .sort(
      (a, b) =>
        faceOrderOf(a.label) - faceOrderOf(b.label) ||
        a.label.localeCompare(b.label, "ja"),
    );
}

/**
 * Auto-fill bookkeeping for publication_name / edition.
 *
 * The desk picks a medium/face tag and the free-text field mirrors it. The
 * mirror must never overwrite a hand edit: we follow the tag only while the
 * field is empty or still equals what we last filled in. Once the editor
 * types their own text, tracking is dropped — a later rename or deselect of
 * the tag must not clobber it.
 *
 * Pure: the caller holds `autoFilled` in a ref and applies the result with
 * separate setState/ref writes (never mutate the ref inside a state updater —
 * React double-invokes updaters in dev).
 */
export function applyDeskAutoFill(
  current: string,
  autoFilled: string | null,
  next: string,
): { value: string; autoFilled: string | null } {
  const stillOurs = current === "" || (autoFilled !== null && current === autoFilled);
  if (!stillOurs) return { value: current, autoFilled: null };
  return { value: next, autoFilled: next ? next : null };
}

/**
 * Paper day from an `<input type="date">` value ("YYYY-MM-DD") to the ISO
 * string Ghost stores (UTC midnight).
 *
 * A paper day is a calendar label, not an instant — pinning UTC midnight keeps
 * the date stable when Ghost stores it naive ("YYYY-MM-DD 00:00:00"), and JST
 * readers still render the same calendar day (UTC+9 is 09:00 that morning).
 * Returns null for anything that is not a real calendar date (e.g. 2026-02-31,
 * which Date.UTC would otherwise roll over to March).
 */
export function deskDateToIso(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value).trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date.toISOString();
}

/**
 * Paper day for desk captions — "2026.10.05" (local calendar date, matching
 * the reading-room dateline's format). Empty string when there is no valid
 * date to show, so callers can render the caption only when it returns one.
 */
export function formatDeskDay(iso: string | null | undefined): string {
  const value = String(iso ?? "").trim();
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}.${month}.${day}`;
}
