import React from "react";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";
import { ESTATE_STATE_KEYS, getPageState } from "./types";

type GalleryImageInput = string | {
  id?: string;
  src?: string;
  image?: string;
  url?: string;
  storage_url?: string;
  poster?: string;
  thumbnail_url?: string;
  title?: string;
  caption?: string;
  label?: string;
  kind?: string;
  media_type?: string;
  is_video?: boolean;
};

type GalleryImage = {
  id: string;
  src: string;
  /** When set, the entry is a video; `src` is the poster image (may be empty). */
  videoSrc?: string;
  isVideo?: boolean;
  title: string;
  caption: string;
};

const isVideoUrl = (u?: string) =>
  /\.(?:mp4|mov|m4v|webm|avi|mkv|ogv|flv|wmv)(?:[?#].*)?$/i.test(String(u || ""));

export interface PropertyGallerySliderProps {
  title?: string;
  description?: string;
  galleryImages?: GalleryImageInput[];
  images?: GalleryImageInput[];
  items?: any[];
  itemIdKey?: string;
  selectedPropertyId?: string;
  selectedPropertyIdKey?: string;
  excludeImage?: string;
  emptyText?: string;
  showHeader?: boolean;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  __stackpage?: StackPageRuntimeApi;
}

function resolveItem(items: any[] | undefined, selectedId: string, itemIdKey: string): any | null {
  if (!items || !items.length || !selectedId) return null;
  return (
    items.find((item) => {
      if (!item || typeof item !== "object") return false;
      return [item[itemIdKey], item.id, item.itemId, item.property_id, item.address, item.building_name].some(
        (candidate) => String(candidate ?? "") === selectedId
      );
    }) || null
  );
}

function normalizeGalleryImages(value: unknown, fallbackTitle: string): GalleryImage[] {
  const items = Array.isArray(value) ? value : [];
  const normalized = items.flatMap((item, index): GalleryImage[] => {
    if (typeof item === "string") {
      const src = item.trim();
      return src
        ? [
            {
              id: `gallery-${index}-${src}`,
              src,
              title: index === 0 ? fallbackTitle : `Image ${index + 1}`,
              caption: "",
            },
          ]
        : [];
    }

    if (!item || typeof item !== "object") return [];
    const typed = item as Exclude<GalleryImageInput, string>;
    const rawSrc = typed.src || typed.image || typed.url || typed.storage_url || "";
    const poster = typed.poster || typed.thumbnail_url || "";
    const kind = String(typed.kind || typed.media_type || "").toLowerCase();
    const isVideo = typed.is_video === true || kind.includes("video") || isVideoUrl(rawSrc);
    // Video: display the poster image, play `rawSrc`. Image: display `rawSrc`.
    const displaySrc = isVideo ? poster : (rawSrc || poster);
    const videoSrc = isVideo ? rawSrc : "";
    if (!displaySrc && !videoSrc) return [];
    const title =
      typed.title ||
      typed.caption ||
      typed.label ||
      (typed.kind || typed.media_type ? String(typed.kind || typed.media_type) : "") ||
      (index === 0 ? fallbackTitle : `Image ${index + 1}`);

    return [
      {
        id: typed.id || `gallery-${index}-${videoSrc || displaySrc}`,
        src: displaySrc,
        videoSrc: videoSrc || undefined,
        isVideo,
        title,
        caption: typed.caption || typed.label || "",
      },
    ];
  });

  const seen = new Set<string>();
  return normalized.filter((item) => {
    const key = item.videoSrc || item.src;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function PropertyGallerySlider({
  title = "Gallery",
  description = "間取り図・室内写真などの補足画像です。",
  galleryImages,
  images,
  items,
  itemIdKey = "id",
  selectedPropertyId,
  selectedPropertyIdKey = ESTATE_STATE_KEYS.selectedPropertyId,
  excludeImage,
  emptyText = "表示できるギャラリー画像がありません。",
  showHeader = true,
  backgroundColor,
  fontSize,
  className = "",
  style,
  __stackpage,
}: PropertyGallerySliderProps) {
  const t = useT();
  const selectedId = selectedPropertyId || String(getPageState(__stackpage, selectedPropertyIdKey, ""));
  const matchedItem = resolveItem(items, selectedId, itemIdKey);
  const fallbackTitle = matchedItem?.building_name || matchedItem?.buildingName || title;
  const sourceImages =
    galleryImages ??
    images ??
    // Canonical image array from the backend (EstateProperty.attachMediaImages):
    // ordered is_primary-first, each { url, thumbnail_url, poster, caption,
    // is_primary, media_type, is_video } — floor plans / rooms included.
    matchedItem?.images ??
    matchedItem?.galleryImages ??
    matchedItem?.gallery_images ??
    matchedItem?.socialMediaAssets ??
    matchedItem?.media ??
    [];
  const slides = normalizeGalleryImages(sourceImages, fallbackTitle).filter(
    (item) => !excludeImage || item.src !== excludeImage
  );

  return (
    <section
      className={`min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}
      style={{ backgroundColor, fontSize, ...style }}
    >
      {showHeader && (
        <div className="flex min-w-0 items-center justify-between gap-3 border-b border-gray-200 px-3 py-3 sm:px-4">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
              {t(title)}
            </div>
            <div className="mt-1 break-words text-sm text-gray-500">{t(description)}</div>
          </div>
          <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
            {slides.length}
          </span>
        </div>
      )}

      {slides.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-gray-400">
          {t(emptyText)}
        </div>
      ) : (
        <div className="flex max-w-full flex-col gap-3 px-3 py-4 sm:px-4 md:flex-row md:overflow-x-auto md:[scrollbar-width:thin] md:snap-x">
          {slides.map((slide) => (
            <article
              key={slide.id}
              className="w-full min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md md:min-w-[220px] md:max-w-[240px] md:shrink-0 md:snap-start"
            >
              <div className="relative h-[190px] overflow-hidden bg-gray-100 md:h-[170px]">
                {slide.isVideo && slide.videoSrc ? (
                  <video
                    src={slide.videoSrc}
                    poster={slide.src || undefined}
                    controls
                    preload="none"
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={slide.src}
                    alt={slide.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/35 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="rounded-full bg-white/90 px-3 py-1 text-center text-xs font-semibold text-gray-800 backdrop-blur-sm">
                    {t(slide.title)}
                  </div>
                </div>
              </div>
              {slide.caption && (
                <div className="px-4 py-3 text-center text-xs leading-5 text-gray-500">
                  {t(slide.caption)}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
