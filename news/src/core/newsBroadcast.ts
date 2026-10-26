/**
 * Shared News broadcast rendition rules.
 *
 * The editor and public reader have different responsibilities, but they must
 * agree on which artifact names are broadcast renditions. Keep the naming and
 * fallback decision here so a new variant cannot be adopted in one surface and
 * silently ignored in the other.
 */

export type NewsBroadcastArtifact = {
  kind?: unknown;
  name?: unknown;
  storageUrl?: unknown;
  metadata?: Record<string, unknown> | null;
};

export type NewsBroadcastSelection = {
  post_id: string;
  item_key?: string | null;
  name?: string | null;
  storage_url?: string | null;
  rendition?: string | null;
};

export type BroadcastRendition =
  | "news-panel-static"
  | "photo-slideshow-static"
  | "photo-slideshow-lipsync";

const text = (value: unknown) => String(value ?? "").trim();

export function broadcastRenditionOf(itemKey: string, name: string): BroadcastRendition | null {
  if (name === `${itemKey}-avatar.mp4`) return "news-panel-static";
  if (name === `${itemKey}-photo-avatar.mp4`) return "photo-slideshow-static";
  const prefix = `${itemKey}-photo-avatar-lipsync-`;
  const suffix = ".mp4";
  const jobId = name.startsWith(prefix) && name.endsWith(suffix)
    ? name.slice(prefix.length, -suffix.length)
    : "";
  return /^[a-f0-9]{24}$/i.test(jobId) ? "photo-slideshow-lipsync" : null;
}

export function isBroadcastArtifact(itemKey: string, artifact: NewsBroadcastArtifact): boolean {
  const name = text(artifact.name);
  if (broadcastRenditionOf(itemKey, name)) return true;
  const assetKind = text(artifact.metadata?.asset_kind).toLowerCase();
  return assetKind === "avatar" || assetKind === "avatar-slideshow";
}

export function broadcastCandidatesOf(
  itemKey: string,
  artifacts: NewsBroadcastArtifact[] | null | undefined,
): NewsBroadcastArtifact[] {
  return (Array.isArray(artifacts) ? artifacts : []).filter((artifact) =>
    artifact && artifact.kind === "video" && isBroadcastArtifact(itemKey, artifact),
  );
}

/** Resolve the public rendition: explicit Post selection first, legacy avatar fallback second. */
export function resolveBroadcastArtifact(
  itemKey: string,
  postId: string | null | undefined,
  artifacts: NewsBroadcastArtifact[] | null | undefined,
  selections: NewsBroadcastSelection[] | null | undefined,
): NewsBroadcastArtifact | null {
  const selected = (Array.isArray(selections) ? selections : []).find((selection) =>
    selection.post_id === postId &&
    selection.rendition !== "legacy-default" &&
    Boolean(text(selection.storage_url)),
  );
  if (selected) {
    return {
      kind: "video",
      name: selected.name || selected.item_key || itemKey,
      storageUrl: selected.storage_url,
      metadata: {selected: true, adoption: "selected", rendition: selected.rendition || null},
    };
  }

  return broadcastCandidatesOf(itemKey, artifacts).find((artifact) =>
    text(artifact.name) === `${itemKey}-avatar.mp4` &&
    text(artifact.metadata?.adoption).toLowerCase() !== "draft" &&
    Boolean(text(artifact.storageUrl)),
  ) || null;
}
