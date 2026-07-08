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

export const buildPropertyDetailPath = (pageId: string, itemId: string) =>
  `/view/${pageId}?item=${encodeURIComponent(itemId)}`;

export const buildRealEstateDetailTransitionPath = (
  pageId: string,
  itemId: string,
  source = "listing-grid",
  postId?: string
) => {
  const post = String(postId || "").trim();
  return (
    `/view/${pageId}?item=${encodeURIComponent(itemId)}` +
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
