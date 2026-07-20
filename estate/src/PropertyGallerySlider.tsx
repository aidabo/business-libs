import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowsPointingOutIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";
import { ESTATE_STATE_KEYS } from "./types";
import { useResolvedPropertyRecord } from "./PropertyInfoCardBase";

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
  is_selected?: boolean;
};

type GalleryImage = {
  id: string;
  src: string;
  /** When set, the entry is a video; `src` is the poster image (may be empty). */
  videoSrc?: string;
  isVideo?: boolean;
  isSelected?: boolean;
  title: string;
  caption: string;
};

const isVideoUrl = (u?: string) =>
  /\.(?:mp4|mov|m4v|webm|avi|mkv|ogv|flv|wmv)(?:[?#].*)?$/i.test(String(u || ""));

// A property's `images[]` is the whole gallery folder, not just renderable media:
// the PDF-extraction pipeline also stores `manifest-*.json` / `text-*.json` entries
// (media_type "other"). Rendering those as <img> yields broken tiles, so keep only
// image/video media. Entries with no media_type (hand-authored props, plain URL
// strings) are kept unless the URL is obviously a non-media artifact.
const NON_MEDIA_URL = /\.(?:json|txt|csv|pdf|xml|ya?ml)(?:[?#].*)?$/i;

const isRenderableMedia = (entry: GalleryImageInput): boolean => {
  if (typeof entry === "string") return !!entry.trim() && !NON_MEDIA_URL.test(entry);
  if (!entry || typeof entry !== "object") return false;
  // Explicit media_type wins: the artifact entries are stored as "other".
  const kind = String(entry.kind || entry.media_type || "").toLowerCase();
  if (kind) return kind.includes("image") || kind.includes("video");
  // No media_type (hand-authored props): keep only if something renderable remains.
  // Note the artifact rows set poster/thumbnail_url to the .json URL too, so every
  // candidate must be checked — not just `url`.
  return [entry.src, entry.image, entry.url, entry.storage_url, entry.poster, entry.thumbnail_url]
    .some((u) => u && !NON_MEDIA_URL.test(String(u)));
};

export interface PropertyGallerySliderProps {
  title?: string;
  description?: string;
  galleryImages?: GalleryImageInput[];
  images?: GalleryImageInput[];
  items?: any[];
  property?: any;
  /** Page-builder binding metadata. Forwarded to the resolver so a bound card waits
   *  for the page-level pre-fetch instead of self-fetching the same property. */
  __bindings?: Record<string, any>;
  itemIdKey?: string;
  selectedPropertyId?: string;
  selectedPropertyIdKey?: string;
  excludeImage?: string;
  emptyText?: string;
  showHeader?: boolean;
  /** Height (px) of each slide's media area. */
  slideHeight?: number;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  __stackpage?: StackPageRuntimeApi;
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
        isSelected: typed.is_selected === true,
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

/** Full-screen viewer for one slide. Portal + the package's shared overlay z-index
 *  (same as MessageDialog/AgentCard) so it clears the page-builder chrome. Closes on
 *  backdrop click, the ✕, or Escape; body scroll is locked while open. Sized with
 *  viewport units so a floor plan fills a phone screen too. */
function GalleryLightbox({
  slide,
  onClose,
  t,
}: {
  slide: GalleryImage;
  onClose: () => void;
  t: (key: string) => string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2147483000] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="presentation"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t("Close")}
        className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-gray-900 shadow-lg transition hover:bg-white"
      >
        <XMarkIcon className="h-6 w-6" />
      </button>
      <figure
        className="flex max-h-full flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {slide.isVideo && slide.videoSrc ? (
          <video
            src={slide.videoSrc}
            poster={slide.src || undefined}
            controls
            autoPlay
            playsInline
            className="max-h-[85vh] max-w-[95vw] rounded-lg bg-black"
          />
        ) : (
          <img
            src={slide.src}
            alt={slide.title}
            className="max-h-[85vh] max-w-[95vw] rounded-lg object-contain"
          />
        )}
        {(slide.caption || slide.title) && (
          <figcaption className="max-w-[95vw] break-words text-center text-sm text-white/90">
            {t(slide.caption || slide.title)}
          </figcaption>
        )}
      </figure>
    </div>,
    document.body,
  );
}

export default function PropertyGallerySlider({
  title = "Gallery",
  description = "間取り図・室内写真などの補足画像です。",
  galleryImages,
  images,
  items,
  property,
  __bindings,
  itemIdKey = "id",
  selectedPropertyId,
  selectedPropertyIdKey = ESTATE_STATE_KEYS.selectedPropertyId,
  excludeImage,
  emptyText = "表示できるギャラリー画像がありません。",
  showHeader = true,
  slideHeight = 240,
  backgroundColor,
  fontSize,
  className = "",
  style,
  __stackpage,
}: PropertyGallerySliderProps) {
  const t = useT();
  // Resolve from bound items[] / selectedPropertyId / ?item (shared cache: one
  // fetch per property per page, even when several cards resolve the same id).
  const matchedItem = useResolvedPropertyRecord({
    items,
    property,
    __bindings,
    selectedPropertyId,
    selectedPropertyIdKey,
    itemIdKey,
    __stackpage,
  });
  const fallbackTitle = matchedItem?.building_name || matchedItem?.buildingName || title;
  // Canonical image array from the backend (EstateProperty.attachMediaImages):
  // ordered is_primary-first, each { url, thumbnail_url, poster, caption,
  // is_primary, media_type, is_video } — floor plans / rooms included.
  const recordImages =
    matchedItem?.images ??
    matchedItem?.galleryImages ??
    matchedItem?.gallery_images ??
    matchedItem?.socialMediaAssets ??
    matchedItem?.media;
  // A resolved property's own media wins over `galleryImages`/`images`. Those props
  // cannot be treated as "the author chose these": the page builder merges preview
  // defaults (stock photos) into every placed widget, so `galleryImages ?? record`
  // would short-circuit on the sample data and the real property images could never
  // render. With no property resolved, the props still drive a static gallery.
  const renderableRecordImages = Array.isArray(recordImages)
    ? recordImages.filter(isRenderableMedia)
    : [];
  const sourceImages =
    renderableRecordImages.length > 0
      ? renderableRecordImages
      : galleryImages ?? images ?? [];
  const normalizedSlides = normalizeGalleryImages(sourceImages, fallbackTitle).filter(
    (item) => !excludeImage || item.src !== excludeImage
  );
  // Select-or-all: if any media is flagged is_selected, show only those; otherwise
  // show all. Mirrors the property Post rule and the edit-screen selection.
  const anySelected = normalizedSlides.some((item) => item.isSelected);
  const slides = anySelected
    ? normalizedSlides.filter((item) => item.isSelected)
    : normalizedSlides;

  // Enlarge-to-view. Tracked by slide id (not index) so it survives a re-order/refetch.
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const expandedSlide = slides.find((item) => item.id === expandedId) || null;

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
              className="w-full min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md md:w-auto md:shrink-0 md:snap-start"
            >
              {/* Every slide keeps the SAME height so the row lines up; width follows
                  each medium's own aspect ratio. Media is `object-contain`, never
                  `cover`: a floor plan (間取り図) has to be readable edge to edge, and
                  cropping a portrait video to fill the box showed only half of it. */}
              <div
                className="relative flex items-center justify-center overflow-hidden bg-gray-50"
                style={{ height: slideHeight }}
              >
                {slide.isVideo && slide.videoSrc ? (
                  <video
                    src={slide.videoSrc}
                    poster={slide.src || undefined}
                    controls
                    preload="metadata"
                    playsInline
                    className="h-full w-auto max-w-[70vw] object-contain md:max-w-[520px]"
                  />
                ) : (
                  <img
                    src={slide.src}
                    alt={slide.title}
                    className="h-full w-auto max-w-[70vw] object-contain md:max-w-[520px]"
                    loading="lazy"
                  />
                )}
                {/* Enlarge. Always visible (not hover-only) so it is reachable on touch,
                    and pinned top-right so it never covers the video's control bar.
                    No overlay label/gradient here: the label duplicated the caption below
                    the media, and the gradient swallowed clicks meant for those controls. */}
                <button
                  type="button"
                  onClick={() => setExpandedId(slide.id)}
                  aria-label={t(slide.isVideo ? "動画を拡大" : "画像を拡大")}
                  title={t(slide.isVideo ? "動画を拡大" : "画像を拡大")}
                  className="absolute right-2 top-2 z-10 rounded-full bg-black/45 p-2 text-white backdrop-blur-sm transition hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white/70"
                >
                  <ArrowsPointingOutIcon className="h-4 w-4" />
                </button>
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

      {expandedSlide && (
        <GalleryLightbox
          slide={expandedSlide}
          onClose={() => setExpandedId(null)}
          t={t}
        />
      )}
    </section>
  );
}
