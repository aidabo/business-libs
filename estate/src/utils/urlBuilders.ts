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

export const buildPropertyDetailPath = (pageId: string, itemId: string) =>
  `/view/${pageId}?item=${encodeURIComponent(itemId)}`;

export const buildRealEstateDetailTransitionPath = (
  pageId: string,
  itemId: string,
  source = "listing-grid"
) =>
  `/view/${pageId}?item=${encodeURIComponent(itemId)}&source=${encodeURIComponent(source)}`;
