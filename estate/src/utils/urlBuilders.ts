export const buildGoogleMapsStreetViewUrl = ({
  viewpoint,
  heading = 170,
  pitch = 8,
  fov = 75,
}: {
  viewpoint: string;
  heading?: number;
  pitch?: number;
  fov?: number;
}) =>
  `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${encodeURIComponent(viewpoint)}&heading=${heading}&pitch=${pitch}&fov=${fov}`;

export const buildGoogleMapsMapUrl = ({
  center,
  zoom = 16,
}: {
  center: string;
  zoom?: number;
}) =>
  `https://www.google.com/maps/@?api=1&map_action=map&center=${encodeURIComponent(center)}&zoom=${zoom}`;

/**
 * Tilted 3D / aerial view of a coordinate in Google Maps (no API key needed).
 * `data=!3m1!1e3` selects the 3D/satellite globe; the `<zoom>a,<fov>y,<tilt>t`
 * segment gives an angled bird's-eye view.
 */
export const buildGoogleMaps3DUrl = ({ center }: { center: string }): string => {
  const [lat, lng] = String(center || "")
    .split(",")
    .map((s) => s.trim());
  if (!lat || !lng) return "";
  return `https://www.google.com/maps/@${lat},${lng},150a,35y,45t/data=!3m1!1e3`;
};

/**
 * Google Maps satellite/hybrid tiles embed for a coordinate (`t=k`), suitable for
 * an <iframe>. No API key required.
 */
export const buildGoogleSatelliteEmbedUrl = ({
  center,
  zoom = 18,
}: {
  center: string;
  zoom?: number;
}): string => {
  const c = String(center || "").trim();
  if (!c.includes(",")) return "";
  return `https://maps.google.com/maps?q=${encodeURIComponent(c)}&t=k&z=${zoom}&output=embed`;
};

/**
 * Base path under which a StackPage is viewed. The estate components run in two
 * surfaces with *different* routes for the same page:
 *   - host app:   `/pages-public/view/<id>` (published) or `/pages/view/<id>` (auth/group)
 *   - demo router: `/view/<id>`
 * Deriving the base from the current location keeps the detail page on the same
 * surface the visitor is already browsing (so auth/group context is preserved),
 * and falls back to the public route for SSR / unknown paths.
 */
const DETAIL_VIEW_BASES = ["/pages-public/view", "/pages/view", "/view"] as const;

export const resolveDetailViewBase = (): string => {
  if (typeof window !== "undefined") {
    const path = window.location?.pathname || "";
    for (const base of DETAIL_VIEW_BASES) {
      if (path === base || path.startsWith(`${base}/`)) return base;
    }
  }
  return "/pages-public/view";
};

/**
 * Base path (query/hash stripped, trailing slash guaranteed) for a detail page
 * target. `detailPage` may be **either**:
 *   - a full/relative page URL the author pasted from the detail page's browser
 *     bar, e.g. `/pages/view/6a4a…/` or `http://host/pages/view/6a4a…/` — used
 *     verbatim (its path already carries the right surface + page id); or
 *   - a bare page id/slug, e.g. `6a4a1f1cd500a608ebeb3bd2` — the surface base is
 *     taken from the current location via `resolveDetailViewBase()`.
 * The app runs with `trailingSlash: true`, so the base always ends in `/` and the
 * query is appended after it (`…/<id>/?item=…`) to avoid a 301 redirect.
 */
export const buildDetailBasePath = (detailPage: string): string => {
  const raw = String(detailPage || "").trim();
  if (!raw) return "";
  const looksLikeUrl = raw.includes("/") || /^https?:/i.test(raw);
  if (looksLikeUrl) {
    const path = raw.split("#")[0].split("?")[0];
    return path.endsWith("/") ? path : `${path}/`;
  }
  return `${resolveDetailViewBase()}/${encodeURIComponent(raw)}/`;
};

export const buildPropertyDetailPath = (detailPage: string, itemId: string) => {
  const base = buildDetailBasePath(detailPage);
  return base ? `${base}?item=${encodeURIComponent(itemId)}` : "";
};

export const buildRealEstateDetailTransitionPath = (
  detailPage: string,
  itemId: string,
  source = "listing-grid",
  postId?: string
) => {
  const base = buildDetailBasePath(detailPage);
  if (!base) return "";
  const post = String(postId || "").trim();
  return (
    `${base}?item=${encodeURIComponent(itemId)}` +
    (post ? `&post=${encodeURIComponent(post)}` : "") +
    `&source=${encodeURIComponent(source)}`
  );
};

/** Extract the property's linked Post id (needs include=posts on the datasource).
 *  Used to open the detail page as ?item=<property_id>&post=<post_id>. */
export const resolvePropertyPostId = (property: any): string => {
  const direct = property?.post_id ?? property?.postId ?? property?.postID;
  if (direct) return String(direct);
  const arr = Array.isArray(property?.posts)
    ? property.posts
    : Array.isArray(property?.ghostPosts)
      ? property.ghostPosts
      : [];
  const first = arr.find((x: any) => x && (x.id || x.post_id));
  return first ? String(first.id || first.post_id) : "";
};
