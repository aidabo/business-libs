import React, { useState, useCallback, useEffect, useRef, useMemo, useId } from 'react';
import type { StackPageRuntimeApi } from './types';

export interface ComicReaderProps {
  title: string;
  pages: string[];
  currentPage?: number;
  totalPages?: number;
  /** Reading direction for page navigation and layout */
  readingDirection?: 'ltr' | 'rtl' | 'vertical';
  /** Display mode: 'paged' (default) for page-by-page, 'webtoon' for vertical scroll */
  mode?: 'paged' | 'webtoon';
  onPageChange?: (page: number) => void;
  /** Show page number indicator */
  showPageIndicator?: boolean;
  /** Enable keyboard navigation (arrow keys) */
  enableKeyboardNav?: boolean;
  /** Currently bookmarked page numbers (0-indexed) */
  bookmarks?: number[];
  /** Called when user toggles bookmark on a page */
  onBookmarkToggle?: (page: number) => void;
  /** Enable double-page / spread view for tablets (paged mode only) */
  spreadMode?: boolean;
  /** Show thumbnail strip at bottom */
  showThumbnails?: boolean;
  /** Called when user clicks a thumbnail */
  onThumbnailSelect?: (page: number) => void;
  /** StackPage runtime integration */
  __stackpage?: StackPageRuntimeApi;
}

/**
 * ComicReader — enhanced manga/comic/webtoon reader with multiple reading modes.
 *
 * ## Features
 * - **Paged mode** (default): page-by-page turning with RTL/LTR/vertical direction
 * - **Webtoon mode**: vertical continuous scroll (スマホ向け縦スクロール読切)
 * - **Spread view**: double-page display for tablets (paged mode only)
 * - **Bookmarks**: toggle bookmarks per page
 * - **Thumbnail strip**: visual page navigation
 * - **Zoom**: fit-width / fit-height / actual-size toggle
 * - **Touch & keyboard navigation**: swipe, arrow keys, Home/End
 * - **RTL support**: right-to-left for Japanese manga (右から左)
 *
 * Reading direction behavior:
 * - `rtl`: Pages read right-to-left (Japanese manga style)
 * - `ltr`: Standard left-to-right (Western comics)
 * - `vertical`: Scroll-down (webtoon/manhwa style, applies to paged mode nav)
 */
const ComicReader: React.FC<ComicReaderProps> = ({
  title,
  pages,
  currentPage: externalPage,
  totalPages: _totalPages = pages.length,
  readingDirection = 'rtl',
  mode = 'paged',
  onPageChange,
  showPageIndicator = true,
  enableKeyboardNav = true,
  bookmarks = [],
  onBookmarkToggle,
  spreadMode = false,
  showThumbnails = false,
  onThumbnailSelect,
  __stackpage,
}) => {
  const [internalPage, setInternalPage] = useState(0);
  const [zoom, setZoom] = useState<'fit-width' | 'fit-height' | 'actual'>('fit-height');
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchPinchDist, setTouchPinchDist] = useState<number | null>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  const webtoonRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const uid = useId();

  const currentPage = externalPage ?? internalPage;
  const totalPages = pages.length;

  // ––– Webtoon: track visible page via IntersectionObserver –––
  useEffect(() => {
    if (mode !== 'webtoon' || pages.length === 0) return;

    const observers: IntersectionObserver[] = [];
    const handleIntersect = (entry: IntersectionObserverEntry) => {
      if (entry.isIntersecting) {
        const idx = Number(entry.target.getAttribute('data-page-index'));
        if (!isNaN(idx) && idx !== currentPage) {
          setInternalPage(idx);
          onPageChange?.(idx);
        }
      }
    };

    pageRefs.current.forEach((el) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => handleIntersect(entry),
        { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [mode, pages.length, currentPage, onPageChange]);

  // ––– Reset page refs when pages change –––
  useEffect(() => {
    pageRefs.current = pageRefs.current.slice(0, pages.length);
  }, [pages.length]);

  const goToPage = useCallback((page: number) => {
    const clamped = Math.max(0, Math.min(page, totalPages - 1));
    setInternalPage(clamped);
    onPageChange?.(clamped);
    __stackpage?.emit('publish:content:selected', {
      id: `page-${clamped + 1}`, title: `Page ${clamped + 1}`,
      contentType: 'comic', source: 'comic-reader',
    });
  }, [totalPages, onPageChange, __stackpage]);

  const goNext = useCallback(() => {
    if (spreadMode) {
      goToPage(Math.min(currentPage + 2, totalPages - 1));
    } else {
      goToPage(currentPage + 1);
    }
  }, [currentPage, goToPage, spreadMode, totalPages]);

  const goPrev = useCallback(() => {
    if (spreadMode) {
      goToPage(Math.max(currentPage - 2, 0));
    } else {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage, spreadMode]);

  const isBookmarked = bookmarks.includes(currentPage);

  const toggleBookmark = useCallback(() => {
    onBookmarkToggle?.(currentPage);
  }, [currentPage, onBookmarkToggle]);

  // ––– Keyboard navigation –––
  useEffect(() => {
    if (!enableKeyboardNav || mode === 'webtoon') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const isRtl = readingDirection === 'rtl';
      if (e.key === 'ArrowRight') isRtl ? goPrev() : goNext();
      if (e.key === 'ArrowLeft') isRtl ? goNext() : goPrev();
      if (e.key === 'ArrowDown') goNext();
      if (e.key === 'ArrowUp') goPrev();
      if (e.key === 'Home') goToPage(0);
      if (e.key === 'End') goToPage(totalPages - 1);
      if (e.key === 'b' || e.key === 'B') toggleBookmark();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardNav, mode, readingDirection, goNext, goPrev, goToPage, totalPages, toggleBookmark]);

  // ––– Touch/swipe navigation (paged mode only) –––
  const handleTouchStart = (e: React.TouchEvent) => {
    if (mode === 'webtoon') return;
    if (e.touches.length === 2) {
      // Pinch start
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchPinchDist(dist);
      return;
    }
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (mode === 'webtoon') return;
    if (e.touches.length === 2 && touchPinchDist) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      // Zoom in/out based on pinch
      if (Math.abs(dist - touchPinchDist) > 30) {
        setZoom((prev) => {
          if (dist > touchPinchDist) {
            return prev === 'fit-width' ? 'actual' : prev === 'fit-height' ? 'fit-width' : 'actual';
          }
          return prev === 'actual' ? 'fit-width' : prev === 'fit-width' ? 'fit-height' : 'fit-height';
        });
        setTouchPinchDist(null); // Reset to avoid repeated toggles
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (mode === 'webtoon') {
      setTouchStart(null);
      return;
    }
    if (!touchStart) { setTouchPinchDist(null); return; }
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Only handle horizontal swipes (ignore vertical scrolling)
    if (absDx > absDy && absDx > 50) {
      const isRtl = readingDirection === 'rtl';
      if (dx < 0) isRtl ? goPrev() : goNext();
      else isRtl ? goNext() : goPrev();
    }
    setTouchStart(null);
    setTouchPinchDist(null);
  };

  const zoomClasses: Record<string, string> = {
    'fit-width': 'w-full object-contain',
    'fit-height': 'h-full object-contain',
    'actual': 'max-w-none',
  };

  // ––– Spread pages for double-page view –––
  const spreadPages = useMemo(() => {
    if (!spreadMode) return null;
    const left = currentPage;
    const right = currentPage + 1;
    if (right >= totalPages) return null; // Can't show spread on last page
    return { left, right };
  }, [spreadMode, currentPage, totalPages]);

  // ––– Thumbnail strip items –––
  const thumbnailItems = useMemo(() => {
    if (!showThumbnails) return [];
    const total = Math.min(totalPages, 30); // Max 30 thumbnails
    const step = Math.max(1, Math.floor(totalPages / total));
    return Array.from({ length: Math.ceil(totalPages / step) }, (_, i) => {
      const pageNum = Math.min(i * step, totalPages - 1);
      return { pageNum, label: readingDirection === 'rtl' ? totalPages - pageNum : pageNum + 1 };
    });
  }, [showThumbnails, totalPages, readingDirection]);

  // ==================================================================
  // RENDER: EMPTY STATE
  // ==================================================================
  if (pages.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-gray-900 text-gray-500">
        No pages available
      </div>
    );
  }

  // ==================================================================
  // RENDER: WEBTOON MODE (縦スクロール)
  // ==================================================================
  if (mode === 'webtoon') {
    return (
      <div ref={readerRef} className="flex flex-col bg-gray-900">
        {/* Webtoon header */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-gray-800 px-4 py-2 text-white">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium truncate">{title}</span>
            <span className="shrink-0 rounded bg-green-600/20 px-1.5 py-0.5 text-[10px] text-green-300">
              Webtoon
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs shrink-0">
            <button
              onClick={toggleBookmark}
              className={`rounded px-2 py-1 transition-colors ${
                isBookmarked ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              {isBookmarked ? '★' : '☆'}
            </button>
            <span className="tabular-nums">
              {currentPage + 1} / {totalPages}
            </span>
          </div>
        </div>

        {/* Webtoon scroll area */}
        <div ref={webtoonRef} className="w-full">
          {pages.map((src, idx) => (
            <div
              key={`${uid}-w-${idx}`}
              ref={(el) => { pageRefs.current[idx] = el; }}
              data-page-index={idx}
              className="relative w-full"
            >
              <img
                src={src}
                alt={`Page ${idx + 1}`}
                className="w-full h-auto object-contain"
                draggable={false}
                loading="lazy"
              />
              {/* Page separator */}
              {idx < pages.length - 1 && (
                <div className="flex items-center justify-center gap-2 py-3">
                  <span className="h-px w-8 bg-gray-700" />
                  <span className="text-xs text-gray-600">{idx + 1}</span>
                  <span className="h-px w-8 bg-gray-700" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Reading progress */}
        {showPageIndicator && (
          <div className="sticky bottom-0 z-10 h-1 w-full bg-gray-800">
            <div
              className="h-full bg-green-500 transition-all duration-200"
              style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  // ==================================================================
  // RENDER: PAGED MODE (ページめくり)
  // ==================================================================
  const pageLabel = readingDirection === 'rtl'
    ? `${totalPages - currentPage} / ${totalPages}`
    : `${currentPage + 1} / ${totalPages}`;

  const hasPrev = currentPage > 0;
  const hasNext = currentPage < totalPages - 1;

  return (
    <div
      ref={readerRef}
      className="flex flex-col bg-gray-900"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Reader Header ── */}
      <div className="flex items-center justify-between bg-gray-800 px-2 py-2 text-white sm:px-4">
        <div className="flex items-center gap-1 min-w-0 sm:gap-2">
          <span className="text-sm font-medium truncate">{title}</span>
          {readingDirection === 'rtl' && (
            <span className="shrink-0 rounded bg-orange-600/20 px-1.5 py-0.5 text-[10px] text-orange-300">
              右⇒左
            </span>
          )}
          {spreadMode && (
            <span className="shrink-0 rounded bg-blue-600/20 px-1.5 py-0.5 text-[10px] text-blue-300">
              見開き
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs shrink-0 sm:gap-2">
          <button
            onClick={toggleBookmark}
            className={`rounded px-1.5 py-1 transition-colors sm:px-2 ${
              isBookmarked ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            {isBookmarked ? '★' : '☆'}
          </button>
          <span className="tabular-nums">{pageLabel}</span>
          {(['fit-width', 'fit-height', 'actual'] as const).map((z) => (
            <button
              key={z}
              onClick={() => setZoom(z)}
              className={`rounded px-1.5 py-1 transition-colors sm:px-2 ${
                zoom === z ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {z === 'fit-width' ? 'W' : z === 'fit-height' ? 'H' : '1:1'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Reader Area ── */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden bg-gray-900 select-none"
        style={{ minHeight: '60vh' }}
        onClick={(e) => {
          if (spreadPages) return; // No click nav in spread mode
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const thresh = rect.width * 0.35;
          if (x < thresh) readingDirection === 'rtl' ? goNext() : goPrev();
          else if (x > rect.width - thresh) readingDirection === 'rtl' ? goPrev() : goNext();
        }}
      >
        {/* Spread view (double-page) */}
        {spreadPages ? (
          <div className="flex h-full w-full items-center justify-center gap-0.5">
            {[spreadPages.left, spreadPages.right].map((pageIdx, side) => (
              <div
                key={pageIdx}
                className={`flex items-center justify-center overflow-hidden ${
                  side === 0 ? (readingDirection === 'rtl' ? 'order-2' : 'order-1') : (readingDirection === 'rtl' ? 'order-1' : 'order-2')
                }`}
                style={{ width: '50%', height: '100%' }}
              >
                <img
                  src={pages[pageIdx]}
                  alt={`Page ${pageIdx + 1}`}
                  className={`${zoomClasses[zoom]} max-h-[75vh] transition-all duration-200`}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Single page */}
            <div
              className={`flex items-center justify-center transition-all duration-300 ${
                readingDirection === 'vertical' ? 'flex-col overflow-y-auto' : ''
              }`}
            >
              <img
                key={currentPage}
                src={pages[currentPage]}
                alt={`Page ${currentPage + 1}`}
                className={`${zoomClasses[zoom]} max-h-[75vh] transition-all duration-200`}
                draggable={false}
              />
            </div>

            {/* Side nav arrows */}
            {hasPrev && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-0 transition-opacity hover:bg-black/70 hover:opacity-100"
                aria-label="Previous page"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={readingDirection === 'rtl' ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
                </svg>
              </button>
            )}
            {hasNext && (
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-0 transition-opacity hover:bg-black/70 hover:opacity-100"
                aria-label="Next page"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={readingDirection === 'rtl' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
                </svg>
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Bottom Navigation ── */}
      {!spreadPages && (
        <div className="flex items-center justify-center gap-2 bg-gray-800 px-2 py-3 sm:gap-4 sm:px-4">
          <button
            onClick={goPrev}
            disabled={!hasPrev}
            className="rounded bg-gray-700 px-3 py-1.5 text-xs text-white hover:bg-gray-600 disabled:opacity-40 transition-colors sm:px-4 sm:text-sm"
          >
            {readingDirection === 'rtl' ? '次へ' : 'Prev'}
          </button>

          {/* Page scrubber */}
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
              const pageNum = Math.max(0, Math.min(
                Math.floor(currentPage / 10) * 10 + i,
                totalPages - 1
              ));
              const isActive = pageNum === currentPage;
              const hasBookmark = bookmarks.includes(pageNum);
              const pageDisplay = readingDirection === 'rtl'
                ? totalPages - pageNum
                : pageNum + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`relative h-6 w-6 rounded text-[10px] transition-colors sm:h-8 sm:w-8 sm:text-xs ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  aria-label={`Go to page ${pageDisplay}`}
                >
                  {pageDisplay}
                  {hasBookmark && (
                    <span className="absolute -right-0.5 -top-0.5 text-[8px] text-yellow-400">★</span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={goNext}
            disabled={!hasNext}
            className="rounded bg-gray-700 px-3 py-1.5 text-xs text-white hover:bg-gray-600 disabled:opacity-40 transition-colors sm:px-4 sm:text-sm"
          >
            {readingDirection === 'rtl' ? '前へ' : 'Next'}
          </button>
        </div>
      )}

      {/* Spread mode nav (simpler) */}
      {spreadPages && (
        <div className="flex items-center justify-center gap-2 bg-gray-800 px-3 py-3 sm:gap-4 sm:px-4">
          <button
            onClick={goPrev}
            disabled={!hasPrev}
            className="rounded bg-gray-700 px-3 py-1.5 text-xs text-white hover:bg-gray-600 disabled:opacity-40 sm:px-4 sm:text-sm"
          >
            ‹ Prev
          </button>
          <span className="text-xs text-gray-400 tabular-nums">
            {spreadPages.left + 1}–{spreadPages.right + 1} / {totalPages}
          </span>
          <button
            onClick={goNext}
            disabled={spreadPages.right >= totalPages - 1}
            className="rounded bg-gray-700 px-3 py-1.5 text-xs text-white hover:bg-gray-600 disabled:opacity-40 sm:px-4 sm:text-sm"
          >
            Next ›
          </button>
        </div>
      )}

      {/* ── Thumbnail Strip ── */}
      {showThumbnails && thumbnailItems.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto bg-gray-850 px-3 py-2" style={{ backgroundColor: '#1a1a2e' }}>
          {thumbnailItems.map(({ pageNum, label }) => (
            <button
              key={pageNum}
              onClick={() => {
                goToPage(pageNum);
                onThumbnailSelect?.(pageNum);
              }}
              className={`shrink-0 overflow-hidden rounded border-2 transition-all ${
                pageNum === currentPage
                  ? 'border-blue-500 opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-90'
              }`}
              style={{ width: 48, height: 64 }}
              aria-label={`Go to page ${label}`}
            >
              <img
                src={pages[pageNum]}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* ── Reading Progress ── */}
      {showPageIndicator && (
        <div className="h-1 w-full bg-gray-800">
          <div
            className="h-full bg-blue-600 transition-all duration-200"
            style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default ComicReader;
