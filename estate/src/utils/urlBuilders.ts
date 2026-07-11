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

/** Google Maps "open" URL that drops a MARKER at the coordinate (or address). Use
 *  this instead of map_action=map (which only centers, no pin). */
export const buildGoogleMapsMarkerUrl = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(String(query || "").trim())}`;

/** Extract a precise "lat,lng" from a Google Maps URL — from a `query=`/`q=` param
 *  or an `@lat,lng` path segment. Lets the cards reuse the precise location the
 *  places search stored in google_map_url rather than the raw property lat/lng. */
export const extractLatLngFromMapUrl = (url?: string): string => {
  const raw = String(url || "");
  if (!raw) return "";
  const q = raw.match(/[?&](?:query|q)=(-?\d+(?:\.\d+)?)(?:%2C|,)\s*(-?\d+(?:\.\d+)?)/i);
  if (q) return `${q[1]},${q[2]}`;
  const at = raw.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (at) return `${at[1]},${at[2]}`;
  return "";
};

/**
 * Tilted 3D / aerial view of a coordinate in Google Maps (no API key needed).
 * `data=!3m1!1e3` selects the 3D/satellite globe; the `<zoom>a,<fov>y,<tilt>t`
 * segment gives an angled bird's-eye view. The `/maps/place/<lat,lng>/` prefix
 * drops a coordinate pin, so the aerial view still marks the property location
 * (a bare `/maps/@…` centers without a marker).
 */
export const buildGoogleMaps3DUrl = ({ center }: { center: string }): string => {
  const [lat, lng] = String(center || "")
    .split(",")
    .map((s) => s.trim());
  if (!lat || !lng) return "";
  const coord = `${lat},${lng}`;
  return `https://www.google.com/maps/place/${coord}/@${coord},150a,35y,45t/data=!3m1!1e3`;
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
 *  Used to open the detail page as ?item=<property_id>&post=<post_id>.
 *
 *  `posts[]` holds `estate_property_posts` **join rows**, where the real Ghost
 *  post id lives in `post_id` — the row's own `id` is the join-row id and must NOT
 *  be used. We prefer `post_id`, falling back to `id` only for arrays of actual
 *  post objects (which carry no `post_id`). Among rows, the primary one wins, then
 *  the lowest `sort_order`. */
export const resolvePropertyPostId = (property: any): string => {
  const direct = property?.post_id ?? property?.postId ?? property?.postID;
  if (direct) return String(direct);

  const arr: any[] = Array.isArray(property?.posts)
    ? property.posts
    : Array.isArray(property?.ghostPosts)
      ? property.ghostPosts
      : [];
  if (!arr.length) return "";

  const rows = arr
    .filter((x) => x && (x.post_id || x.id))
    .sort((a, b) => {
      const primary = (a.is_primary ? 0 : 1) - (b.is_primary ? 0 : 1);
      if (primary !== 0) return primary;
      return Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0);
    });

  const pick = rows[0];
  // post_id (join FK to the actual post) wins over id (join-row id).
  return pick ? String(pick.post_id ?? pick.id ?? "") : "";
};
