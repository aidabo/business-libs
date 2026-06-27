import React, { useState, useMemo } from 'react';
import type { SeriesItem } from './types';

export interface SeriesListProps {
  /** Array of series items to display */
  series: SeriesItem[];
  /** Called when a series is selected/clicked */
  onSelectSeries?: (seriesId: string) => void;
  /** Show search bar */
  showSearch?: boolean;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Show genre filter tabs */
  showFilter?: boolean;
  /** Grid columns (2-6) */
  columns?: number;
  /** Max items to show (0 = unlimited) */
  maxItems?: number;
  /** Title for the section */
  title?: string;
}

/**
 * SeriesList — manga/comic series catalog grid with search, genre filtering, and favorites.
 *
 * 漫画・コミックシリーズ一覧。検索、ジャンルフィルター、お気に入り表示に対応。
 * カバー画像・評価・連載状況・チャプター数をカード形式で表示します。
 *
 * Features:
 * - Search-as-you-type filtering
 * - Genre filter tabs (auto-extracted from series data)
 * - Loading, empty, and error states
 * - Responsive grid layout
 * - Status badge (ongoing/completed/hiatus)
 * - Bookmark indicator
 */
const SeriesList: React.FC<SeriesListProps> = ({
  series,
  onSelectSeries,
  showSearch = true,
  searchPlaceholder = 'Search series...',
  showFilter = true,
  columns = 4,
  maxItems = 0,
  title = 'Series',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'rating' | 'title'>('latest');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Extract unique genres from data
  const allGenres = useMemo(() => {
    const genreSet = new Set<string>();
    series.forEach((s) => s.genres?.forEach((g) => genreSet.add(g)));
    return Array.from(genreSet).sort();
  }, [series]);

  // Filter and sort
  const filteredSeries = useMemo(() => {
    let result = [...series];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.author?.toLowerCase().includes(q) ||
          s.genres?.some((g) => g.toLowerCase().includes(q))
      );
    }

    // Genre filter
    if (activeGenre) {
      result = result.filter((s) => s.genres?.includes(activeGenre));
    }

    // Favorites filter
    if (showFavoritesOnly) {
      result = result.filter((s) => s.isBookmarked);
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'latest':
      default:
        result.sort(
          (a, b) =>
            (b.updatedAt ? new Date(b.updatedAt).getTime() : 0) -
            (a.updatedAt ? new Date(a.updatedAt).getTime() : 0)
        );
        break;
    }

    // Apply maxItems
    if (maxItems > 0) {
      result = result.slice(0, maxItems);
    }

    return result;
  }, [series, searchQuery, activeGenre, showFavoritesOnly, sortBy, maxItems]);

  const statusConfig: Record<string, { label: string; class: string }> = {
    ongoing: { label: '連載中', class: 'bg-green-500' },
    completed: { label: '完結', class: 'bg-blue-500' },
    hiatus: { label: '休載中', class: 'bg-amber-500' },
    cancelled: { label: '打ち切り', class: 'bg-red-500' },
  };

  const genreFilterChips = ['All', ...allGenres];

  // Column class mapping
  const colClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  }[columns] ?? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';

  // ==================================================================
  // RENDER
  // ==================================================================
  return (
    <section className="py-4">
      {/* ── Header ── */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-gray-900 md:text-xl">{title}</h2>

        {/* Sort + Favorites toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFavoritesOnly((v) => !v)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              showFavoritesOnly
                ? 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-300'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {showFavoritesOnly ? '★ Favorites' : '☆ Favorites'}
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="latest">Latest</option>
            <option value="rating">Top Rated</option>
            <option value="title">A–Z</option>
          </select>
        </div>
      </div>

      {/* ── Search Bar ── */}
      {showSearch && (
        <div className="relative mb-3">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
            aria-label="Search series"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* ── Genre Filter Chips ── */}
      {showFilter && genreFilterChips.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {genreFilterChips.map((genre) => {
            const isActive = genre === 'All' ? activeGenre === null : activeGenre === genre;
            return (
              <button
                key={genre}
                onClick={() => setActiveGenre(genre === 'All' ? null : genre)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {genre === 'All' ? `All (${series.length})` : genre}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Series Grid ── */}
      {filteredSeries.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-2 text-gray-400">
          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-sm">No series found</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-orange-500 hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className={`grid ${colClass} gap-3 md:gap-4`}>
          {filteredSeries.map((item) => {
            const st = statusConfig[item.status ?? 'ongoing'] ?? statusConfig.ongoing;
            return (
              <div
                key={item.id}
                className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                onClick={() => onSelectSeries?.(item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') onSelectSeries?.(item.id); }}
              >
                {/* Cover image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                  {item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-300">
                      <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}

                  {/* Status badge */}
                  <span className={`absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white ${st.class}`}>
                    {st.label}
                  </span>

                  {/* Bookmark indicator */}
                  {item.isBookmarked && (
                    <span className="absolute right-1.5 top-1.5 text-yellow-400 drop-shadow-sm">
                      ★
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-2.5">
                  <h3 className="text-sm font-semibold leading-tight text-gray-900 line-clamp-2">
                    {item.title}
                  </h3>
                  {item.author && (
                    <p className="mt-0.5 text-xs text-gray-500 truncate">{item.author}</p>
                  )}
                  <div className="mt-1.5 flex items-center justify-between">
                    {/* Rating */}
                    {item.rating !== undefined && (
                      <span className="flex items-center gap-0.5 text-xs text-amber-500">
                        ★ {item.rating.toFixed(1)}
                      </span>
                    )}
                    {/* Chapter count */}
                    {item.chapterCount !== undefined && (
                      <span className="text-xs text-gray-400">{item.chapterCount}ch</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Result count ── */}
      {filteredSeries.length > 0 && (
        <p className="mt-3 text-center text-xs text-gray-400">
          {filteredSeries.length} of {series.length} series
          {showFavoritesOnly && ' (favorites)'}
        </p>
      )}
    </section>
  );
};

export default SeriesList;
