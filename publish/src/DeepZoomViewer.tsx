import React, { useEffect, useRef, useState, useCallback } from "react";

// IMPORTANT: OpenSeadragon is browser-only and must be loaded dynamically.
// Do NOT import openseadragon at the top level — it references window/document
// and will fail in Next.js SSR.

// ---------------------------------------------------------------------------
// "Reading Room" — a digital reading room for print.
//
// An immersive e-paper reader for high-resolution scanned newspaper / magazine
// pages. Ink-dark reading canvas, a nameplate masthead, auto-hiding floating
// controls, and a bottom folio filmstrip. Restraint everywhere except the
// signature: the print folio + hairline dateline, and a single cinnabar "seal"
// accent reserved for live / active meaning.
// ---------------------------------------------------------------------------

// ── Design tokens (kept local so the shared component has no build deps) ────
const INK = "#14161B"; // reading canvas
const INK_BAR = "rgba(20,22,27,0.72)"; // floating chrome (glass)
const HAIRLINE = "rgba(255,255,255,0.10)";
const TEXT = "#ECEEF1";
const MIST = "#9AA0AC";
const SEAL = "#C8402E"; // hanko / print red — live + active only
const SERIF =
  '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, "Times New Roman", serif';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DeepZoomViewerProps {
  /** Publication title — set in the serif nameplate */
  title: string;
  /** Secondary line: edition, dateline, section (tracked small caps) */
  subtitle?: string;
  /** Array of DZI descriptor URLs, one per page */
  dziUrls: string[];
  /** Optional per-page thumbnail image URLs (same length as dziUrls) */
  thumbUrls?: string[];
  /** Current page index (0-based) */
  currentPage?: number;
  /** Called when the user navigates to a different page */
  onPageChange?: (page: number) => void;
  /** Show page navigation + filmstrip (default true) */
  showPageNav?: boolean;
  /** Job ID — used to build DZI URLs from context */
  jobId?: string;
  /** StackPage interaction key for content selection */
  selectedContentIdKey?: string;
  /** StackPage shared state key */
  keywordKey?: string;
  /** StackPage runtime API */
  __stackpage?: any;
  /** Enable keyboard navigation (Arrows, Home/End, +/-, F). Default true. */
  enableKeyboardNav?: boolean;
}

// ---------------------------------------------------------------------------
// Small inline icon set (stroke, 1.6) — quiet and consistent
// ---------------------------------------------------------------------------

type IconProps = { className?: string };
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const IconChevronLeft = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" {...stroke}><path d="M15 5l-7 7 7 7" /></svg>
);
const IconChevronRight = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" {...stroke}><path d="M9 5l7 7-7 7" /></svg>
);
const IconMinus = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" {...stroke}><path d="M5 12h14" /></svg>
);
const IconPlus = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" {...stroke}><path d="M12 5v14M5 12h14" /></svg>
);
// "Fit page" — four arrows converging toward the centre (distinct from the
// outward corner brackets of IconExpand / full screen).
const IconFit = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" {...stroke}>
    <path d="M4 4l4.5 4.5M8.5 5.5V8.5H5.5" />
    <path d="M20 4l-4.5 4.5M15.5 5.5V8.5H18.5" />
    <path d="M4 20l4.5-4.5M5.5 15.5H8.5V18.5" />
    <path d="M20 20l-4.5-4.5M18.5 15.5H15.5V18.5" />
  </svg>
);
const IconRotate = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" {...stroke}>
    <path d="M4 4v5h5" /><path d="M20 20v-5h-5" />
    <path d="M19.4 9A8 8 0 004.6 8M4.6 15A8 8 0 0019.4 16" />
  </svg>
);
const IconExpand = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" {...stroke}>
    <path d="M8 3H4a1 1 0 00-1 1v4M16 3h4a1 1 0 011 1v4M8 21H4a1 1 0 01-1-1v-4M16 21h4a1 1 0 001-1v-4" />
  </svg>
);
const IconCollapse = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" {...stroke}>
    <path d="M4 8h4V4M20 8h-4V4M4 16h4v4M20 16h-4v4" />
  </svg>
);
const IconFilm = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" {...stroke}>
    <rect x="3" y="6" width="18" height="12" rx="1.5" /><path d="M9 6v12M15 6v12" />
  </svg>
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Zero-pad a page number for the print folio (e.g. 7 → "007"). */
function folio(n: number, total: number): string {
  const width = Math.max(2, String(total).length);
  return String(n).padStart(width, "0");
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const DeepZoomViewer: React.FC<DeepZoomViewerProps> = ({
  title,
  subtitle,
  dziUrls,
  thumbUrls,
  currentPage: externalPage,
  onPageChange,
  showPageNav = true,
  enableKeyboardNav = true,
  jobId: _jobId,
  selectedContentIdKey: _selectedContentIdKey,
  keywordKey: _keywordKey,
  __stackpage: _stackpage,
}) => {
  const [internalPage, setInternalPage] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [filmstripOpen, setFilmstripOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const OSDRef = useRef<any>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filmstripRef = useRef<HTMLDivElement | null>(null);

  const currentPage = externalPage ?? internalPage;
  const totalPages = dziUrls.length;
  const multi = totalPages > 1;

  // ── Navigation ─────────────────────────────────────────────────────────
  const goToPage = useCallback(
    (page: number) => {
      const clamped = Math.max(0, Math.min(page, totalPages - 1));
      if (clamped === currentPage && viewerRef.current) return;
      setInternalPage(clamped);
      onPageChange?.(clamped);
    },
    [totalPages, currentPage, onPageChange],
  );
  const goNext = useCallback(() => {
    if (currentPage < totalPages - 1) goToPage(currentPage + 1);
  }, [currentPage, totalPages, goToPage]);
  const goPrev = useCallback(() => {
    if (currentPage > 0) goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  // ── Auto-hide chrome (reveal on movement, hide after idle) ──────────────
  const revealChrome = useCallback(() => {
    setChromeVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (prefersReducedMotion()) return; // keep controls persistent
    hideTimerRef.current = setTimeout(() => setChromeVisible(false), 2600);
  }, []);

  useEffect(() => {
    revealChrome();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [revealChrome, currentPage]);

  // ── Initialize / switch OpenSeadragon viewer (dynamic import) ───────────
  useEffect(() => {
    if (!containerRef.current || totalPages === 0) return;

    let cancelled = false;
    setStatus("loading");
    setErrorMessage(null);

    const dziUrl = dziUrls[currentPage];

    import("openseadragon")
      .then((OSDModule) => {
        if (cancelled) return;
        const OpenSeadragon = OSDModule.default || OSDModule;
        OSDRef.current = OpenSeadragon;

        if (viewerRef.current) {
          viewerRef.current.destroy();
          viewerRef.current = null;
        }

        const viewer = OpenSeadragon({
          element: containerRef.current!,
          tileSources: dziUrl,
          prefixUrl: "",
          // Load tiles CORS-clean so the navigator (mini-map) can render them.
          // Cross-origin CloudFront tiles are otherwise canvas-tainted and the
          // navigator draws blank; our S3/CloudFront returns Access-Control-
          // Allow-Origin, and same-origin (filesystem) tiles are unaffected.
          crossOriginPolicy: "Anonymous",
          loadTilesWithAjax: false,
          // We render our own chrome — hide OSD's default control cluster.
          showNavigationControl: false,
          showSequenceControl: false,
          showNavigator: true,
          navigatorPosition: "TOP_RIGHT",
          navigatorSizeRatio: 0.13,
          navigatorBorderColor: HAIRLINE,
          navigatorDisplayRegionColor: SEAL,
          navigatorAutoFade: true,
          gestureSettingsMouse: {
            scrollToZoom: true,
            clickToZoom: false,
            dblClickToZoom: true,
            pinchToZoom: true,
            flickEnabled: true,
          },
          gestureSettingsTouch: {
            pinchToZoom: true,
            flickEnabled: true,
            dblClickToZoom: true,
          },
          homeFillsViewer: false,
          minZoomImageRatio: 0.8,
          maxZoomPixelRatio: 12,
          visibilityRatio: 0.85,
          smoothTileEdgesMinZoom: Infinity,
          animationTime: prefersReducedMotion() ? 0 : 0.6,
          springStiffness: 8,
          defaultZoomLevel: 0,
          immediateRender: false,
        });

        viewerRef.current = viewer;
        viewer.addHandler("open", () => {
          if (!cancelled) setStatus("ready");
        });
        viewer.addHandler("open-failed", () => {
          if (!cancelled) {
            setStatus("error");
            setErrorMessage("This page could not be loaded.");
          }
        });
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage("The deep-zoom engine could not be loaded.");
        }
      });

    return () => {
      cancelled = true;
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [dziUrls, currentPage, totalPages, retryCount]);

  // ── Keep the active filmstrip thumb centered ────────────────────────────
  // Scroll ONLY the filmstrip container (its own scrollLeft), never via
  // Element.scrollIntoView — that scrolls every scrollable ancestor (it was
  // scrolling the whole page and dragging the viewer sideways). Center using the
  // thumb's offsetLeft, which is a stable layout coordinate relative to the
  // (position:relative) strip — independent of getBoundingClientRect, current
  // scroll, and the strip's show/hide translateY. Retry across a few frames
  // because on a page jump the strip may not be laid out / scrollable yet.
  useEffect(() => {
    const strip = filmstripRef.current;
    if (!strip) return;
    let raf = 0;
    let tries = 0;
    const center = () => {
      const thumb = strip.querySelector<HTMLElement>(
        `[data-dz-thumb="${currentPage}"]`,
      );
      const max = strip.scrollWidth - strip.clientWidth;
      // Not scrollable / not measured yet — wait for layout, up to ~10 frames.
      if (!thumb || max <= 0) {
        if (tries++ < 10) raf = requestAnimationFrame(center);
        return;
      }
      const target =
        thumb.offsetLeft + thumb.offsetWidth / 2 - strip.clientWidth / 2;
      const left = Math.max(0, Math.min(target, max));
      if (prefersReducedMotion() || typeof strip.scrollTo !== "function") {
        strip.scrollLeft = left;
      } else {
        strip.scrollTo({ left, behavior: "smooth" });
      }
    };
    raf = requestAnimationFrame(center);
    return () => cancelAnimationFrame(raf);
  }, [currentPage, totalPages, filmstripOpen, chromeVisible]);

  // ── Fullscreen ──────────────────────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // ── Zoom / fit helpers ──────────────────────────────────────────────────
  const zoomIn = useCallback(() => viewerRef.current?.viewport?.zoomBy?.(1.5) || viewerRef.current?.viewport?.applyConstraints?.(), []);
  const zoomOut = useCallback(() => viewerRef.current?.viewport?.zoomBy?.(0.66) || viewerRef.current?.viewport?.applyConstraints?.(), []);
  const resetZoom = useCallback(() => viewerRef.current?.viewport?.goHome?.(), []);
  const rotate = useCallback(() => {
    const vp = viewerRef.current?.viewport;
    if (vp?.setRotation) vp.setRotation(((vp.getRotation?.() || 0) + 90) % 360);
  }, []);
  const handleRetry = useCallback(() => setRetryCount((c) => c + 1), []);

  // ── Keyboard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enableKeyboardNav) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      switch (e.key) {
        case "ArrowRight": case "ArrowDown": case " ": e.preventDefault(); goNext(); break;
        case "ArrowLeft": case "ArrowUp": e.preventDefault(); goPrev(); break;
        case "Home": e.preventDefault(); goToPage(0); break;
        case "End": e.preventDefault(); goToPage(totalPages - 1); break;
        case "+": case "=": zoomIn(); break;
        case "-": case "_": zoomOut(); break;
        case "0": resetZoom(); break;
        case "f": case "F": toggleFullscreen(); break;
        default: return;
      }
      revealChrome();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enableKeyboardNav, goNext, goPrev, goToPage, totalPages, zoomIn, zoomOut, resetZoom, toggleFullscreen, revealChrome]);

  // ── Empty state ─────────────────────────────────────────────────────────
  if (totalPages === 0) {
    return (
      <div
        className="flex h-full min-h-[50vh] w-full items-center justify-center"
        style={{ background: INK, color: MIST }}
      >
        <div className="text-center">
          <div className="mx-auto mb-3 h-px w-16" style={{ background: HAIRLINE }} />
          <p className="text-sm" style={{ fontFamily: SERIF, fontSize: 17, color: TEXT }}>
            No pages to display
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.22em]" style={{ color: MIST }}>
            The edition is empty
          </p>
        </div>
      </div>
    );
  }

  const chromeTransition = "opacity 320ms ease, transform 320ms ease";
  const chromeStyle = (offset: string): React.CSSProperties => ({
    transition: chromeTransition,
    opacity: chromeVisible ? 1 : 0,
    transform: chromeVisible ? "translateY(0)" : offset,
    pointerEvents: chromeVisible ? "auto" : "none",
  });

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div
      ref={rootRef}
      className="relative h-full w-full select-none overflow-hidden"
      style={{ background: INK, color: TEXT, minHeight: "60vh" }}
      onMouseMove={revealChrome}
      onClick={() => { if (!chromeVisible) revealChrome(); }}
      role="region"
      aria-label={`${title} deep zoom reader`}
    >
      {/* ── Reading canvas ── */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Vignette to seat the scan on the ink canvas */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: "inset 0 0 180px rgba(0,0,0,0.55)" }}
      />

      {/* ── Masthead (nameplate) ── */}
      <div
        className="absolute inset-x-0 top-0 z-20"
        style={chromeStyle("translateY(-100%)")}
      >
        <div
          className="flex items-center gap-3 px-4 py-3 sm:px-6"
          style={{
            background: `linear-gradient(180deg, ${INK} 0%, rgba(20,22,27,0.6) 60%, transparent 100%)`,
          }}
        >
          <div className="min-w-0 flex-1">
            <h2
              className="truncate leading-none"
              style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em", color: TEXT }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className="mt-1 truncate text-[10.5px] uppercase"
                style={{ letterSpacing: "0.24em", color: MIST }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Folio + live status */}
          <div className="flex shrink-0 items-center gap-3">
            <span
              className="tabular-nums text-[12px]"
              style={{ letterSpacing: "0.14em", color: MIST }}
            >
              <span style={{ color: TEXT }}>{folio(currentPage + 1, totalPages)}</span>
              <span className="mx-1 opacity-50">/</span>
              {folio(totalPages, totalPages)}
            </span>
            <span
              className="inline-flex h-1.5 w-1.5 rounded-full"
              style={{
                background: status === "error" ? SEAL : status === "ready" ? "#5FB08C" : MIST,
              }}
              title={status}
              aria-hidden
            />
          </div>
        </div>
      </div>

      {/* ── Edge page turners ── */}
      {showPageNav && multi && (
        <>
          <button
            onClick={goPrev}
            disabled={currentPage <= 0}
            aria-label="Previous page"
            className="group absolute left-0 top-1/2 z-20 flex h-full w-[13%] max-w-[120px] -translate-y-1/2 appearance-none items-center justify-start border-0 bg-transparent p-0 pl-2 disabled:pointer-events-none disabled:opacity-0 focus:outline-none sm:pl-4"
            style={{ ...chromeStyle("translateY(-50%)"), background: "transparent", border: "none", WebkitAppearance: "none", appearance: "none" }}
          >
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full backdrop-blur transition-transform group-hover:scale-105 group-focus-visible:ring-2"
              style={{ background: INK_BAR, border: `1px solid ${HAIRLINE}`, color: TEXT }}
            >
              <IconChevronLeft className="h-5 w-5" />
            </span>
          </button>
          <button
            onClick={goNext}
            disabled={currentPage >= totalPages - 1}
            aria-label="Next page"
            className="group absolute right-0 top-1/2 z-20 flex h-full w-[13%] max-w-[120px] -translate-y-1/2 appearance-none items-center justify-end border-0 bg-transparent p-0 pr-2 disabled:pointer-events-none disabled:opacity-0 focus:outline-none sm:pr-4"
            style={{ ...chromeStyle("translateY(-50%)"), background: "transparent", border: "none", WebkitAppearance: "none", appearance: "none" }}
          >
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full backdrop-blur transition-transform group-hover:scale-105"
              style={{ background: INK_BAR, border: `1px solid ${HAIRLINE}`, color: TEXT }}
            >
              <IconChevronRight className="h-5 w-5" />
            </span>
          </button>
        </>
      )}

      {/* ── Loading ── */}
      {status === "loading" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center" style={{ background: "rgba(20,22,27,0.55)" }}>
          <div className="text-center">
            <span
              className="mx-auto mb-3 block h-7 w-7 animate-spin rounded-full"
              style={{ border: `2px solid ${HAIRLINE}`, borderTopColor: SEAL }}
            />
            <p className="text-[11px] uppercase tracking-[0.24em]" style={{ color: MIST }}>
              Setting page {folio(currentPage + 1, totalPages)}
            </p>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {status === "error" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center px-6" style={{ background: "rgba(20,22,27,0.82)" }}>
          <div className="max-w-xs text-center">
            <p className="mb-1" style={{ fontFamily: SERIF, fontSize: 18, color: TEXT }}>
              {errorMessage || "This page could not be loaded."}
            </p>
            <p className="mb-4 text-[11px] uppercase tracking-[0.2em]" style={{ color: MIST }}>
              Page {folio(currentPage + 1, totalPages)}
            </p>
            <button
              onClick={handleRetry}
              className="rounded-full px-5 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2"
              style={{ background: SEAL, color: "#fff" }}
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* ── Floating control cluster ── */}
      <div
        className="absolute inset-x-0 z-20 flex justify-center px-4"
        style={{ bottom: showPageNav && multi && filmstripOpen ? 132 : 20, ...chromeStyle("translateY(150%)") }}
      >
        <div
          className="flex items-center gap-1 rounded-full px-2 py-1.5 backdrop-blur"
          style={{ background: INK_BAR, border: `1px solid ${HAIRLINE}`, boxShadow: "0 8px 30px rgba(0,0,0,0.4)" }}
        >
          <CtrlButton label="Zoom out" onClick={zoomOut}><IconMinus className="h-[18px] w-[18px]" /></CtrlButton>
          <CtrlButton label="Fit page" onClick={resetZoom}><IconFit className="h-[18px] w-[18px]" /></CtrlButton>
          <CtrlButton label="Zoom in" onClick={zoomIn}><IconPlus className="h-[18px] w-[18px]" /></CtrlButton>
          <Divider />
          <CtrlButton label="Rotate 90°" onClick={rotate}><IconRotate className="h-[18px] w-[18px]" /></CtrlButton>
          {showPageNav && multi && (
            <CtrlButton
              label={filmstripOpen ? "Hide pages" : "Show pages"}
              onClick={() => setFilmstripOpen((v) => !v)}
              active={filmstripOpen}
            >
              <IconFilm className="h-[18px] w-[18px]" />
            </CtrlButton>
          )}
          <CtrlButton label={isFullscreen ? "Exit full screen" : "Full screen"} onClick={toggleFullscreen}>
            {isFullscreen ? <IconCollapse className="h-[18px] w-[18px]" /> : <IconExpand className="h-[18px] w-[18px]" />}
          </CtrlButton>
        </div>
      </div>

      {/* ── Folio filmstrip ── */}
      {showPageNav && multi && (
        <div
          className="absolute inset-x-0 bottom-0 z-20 max-w-full"
          style={{
            ...chromeStyle("translateY(100%)"),
            opacity: chromeVisible && filmstripOpen ? 1 : 0,
            transform: chromeVisible && filmstripOpen ? "translateY(0)" : "translateY(100%)",
            pointerEvents: chromeVisible && filmstripOpen ? "auto" : "none",
          }}
        >
          <div
            ref={filmstripRef}
            className="relative flex w-full min-w-0 max-w-full items-end gap-2.5 overflow-x-auto overflow-y-hidden px-4 py-3 sm:px-6"
            style={{
              background: `linear-gradient(0deg, ${INK} 0%, rgba(20,22,27,0.72) 70%, transparent 100%)`,
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(236,238,241,0.4) transparent",
              WebkitOverflowScrolling: "touch",
              overscrollBehaviorX: "contain",
            }}
          >
            {dziUrls.map((_, idx) => {
              const active = idx === currentPage;
              const thumb = thumbUrls?.[idx];
              return (
                <button
                  key={idx}
                  data-dz-thumb={idx}
                  onClick={() => goToPage(idx)}
                  aria-label={`Go to page ${idx + 1}`}
                  aria-current={active ? "page" : undefined}
                  className="group relative shrink-0 appearance-none border-0 bg-transparent p-0 focus:outline-none"
                  style={{ background: "transparent", border: "none", WebkitAppearance: "none", appearance: "none" }}
                >
                  {/* Seal tick over the active page */}
                  <span
                    className="absolute -top-1 left-1/2 h-[3px] w-7 -translate-x-1/2 rounded-full transition-opacity"
                    style={{ background: SEAL, opacity: active ? 1 : 0 }}
                  />
                  <span
                    className="flex items-center justify-center overflow-hidden transition-all"
                    style={{
                      width: 68,
                      height: 90,
                      background: "#0F1013",
                      border: `1px solid ${active ? "rgba(236,238,241,0.55)" : HAIRLINE}`,
                      boxShadow: active ? "0 4px 14px rgba(0,0,0,0.5)" : "none",
                      transform: active ? "translateY(-2px)" : "none",
                    }}
                  >
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt=""
                        className="h-full w-full object-cover"
                        style={{ opacity: active ? 1 : 0.66 }}
                        onError={(e) => { (e.currentTarget.style.display = "none"); }}
                      />
                    ) : (
                      <span
                        className="tabular-nums text-[15px]"
                        style={{ fontFamily: SERIF, color: active ? TEXT : MIST }}
                      >
                        {idx + 1}
                      </span>
                    )}
                  </span>
                  <span
                    className="mt-1 block text-center text-[10.5px] tabular-nums tracking-[0.1em]"
                    style={{ color: active ? TEXT : MIST }}
                  >
                    {folio(idx + 1, totalPages)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Control primitives
// ---------------------------------------------------------------------------

function CtrlButton({
  label, onClick, children, active,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className="flex h-8 w-8 appearance-none items-center justify-center rounded-full border-0 bg-transparent transition-colors focus:outline-none focus-visible:ring-2"
      style={{ color: active ? SEAL : TEXT, background: "transparent", border: "none", WebkitAppearance: "none", appearance: "none" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-0.5 h-5 w-px" style={{ background: HAIRLINE }} aria-hidden />;
}

export default DeepZoomViewer;
