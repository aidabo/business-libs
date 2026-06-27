import React from 'react';

export interface SeriesHeaderProps {
  /** Series title */
  title: string;
  /** Cover image URL */
  coverImage?: string;
  /** Author name */
  author?: string;
  /** Artist name (manga-specific, may differ from author) */
  artist?: string;
  /** Genre/category tags */
  genres?: string[];
  /** Star rating (1-5) */
  rating?: number;
  /** Series synopsis/description */
  synopsis?: string;
  /** Publication status */
  status?: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
  /** Total chapter count */
  chapterCount?: number;
  /** Latest chapter label */
  latestChapter?: string;
  /** Series start date */
  startDate?: string;
  /** Series end date (for completed series) */
  endDate?: string;
  /** Whether series is bookmarked/favorited by user */
  isBookmarked?: boolean;
  /** Bookmark toggle handler */
  onBookmarkToggle?: () => void;
}

/**
 * SeriesHeader — manga/comic series detail header with cover, metadata, genres, and synopsis.
 *
 * 作品詳細ヘッダー。漫画・コミックシリーズのカバー、作者、ジャンルタグ、
 * 評価、あらすじ、連載状況を表示します。
 *
 * Features:
 * - Cover image with info overlay
 * - Author/artist display
 * - Genre tags with color coding
 * - Star rating display
 * - Status badge (ongoing/completed/hiatus)
 * - Bookmark toggle
 * - Synopsis section
 */
const SeriesHeader: React.FC<SeriesHeaderProps> = ({
  title,
  coverImage,
  author,
  artist,
  genres,
  rating,
  synopsis,
  status = 'ongoing',
  chapterCount,
  latestChapter,
  startDate,
  endDate,
  isBookmarked = false,
  onBookmarkToggle,
}) => {
  const statusConfig: Record<string, { label: string; class: string }> = {
    ongoing: { label: '連載中', class: 'bg-green-600' },
    completed: { label: '完結', class: 'bg-blue-600' },
    hiatus: { label: '休載中', class: 'bg-amber-600' },
    cancelled: { label: '打ち切り', class: 'bg-red-600' },
  };

  const statusInfo = statusConfig[status] ?? statusConfig.ongoing;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm md:flex-row">
      {/* ── Cover Image ── */}
      {coverImage && (
        <div className="relative shrink-0 md:w-56">
          <img
            src={coverImage}
            alt={title}
            className="h-64 w-full object-cover md:h-full"
          />
          {/* Status badge overlay */}
          <span
            className={`absolute left-2 top-2 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ${statusInfo.class}`}
          >
            {statusInfo.label}
          </span>
        </div>
      )}

      {/* ── Info ── */}
      <div className="flex flex-1 flex-col p-5">
        {/* Title & bookmark */}
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-serif text-xl font-bold leading-tight text-gray-900 md:text-2xl">
            {title}
          </h1>
          {onBookmarkToggle && (
            <button
              onClick={onBookmarkToggle}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                isBookmarked
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              aria-label={isBookmarked ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
            </button>
          )}
        </div>

        {/* Metadata row */}
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
          {author && <span>作: {author}</span>}
          {artist && artist !== author && <span>画: {artist}</span>}
          {chapterCount !== undefined && (
            <span className="font-medium text-gray-700">{chapterCount} chapters</span>
          )}
          {latestChapter && (
            <span className="text-gray-400">~ {latestChapter}</span>
          )}
        </div>

        {/* Genre tags */}
        {genres && genres.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {genres.map((genre) => (
              <span
                key={genre}
                className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700 ring-1 ring-orange-200"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Star rating */}
        {rating !== undefined && (
          <div className="mt-3 flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                className={`text-sm ${i < Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
              >
                ★
              </span>
            ))}
            <span className="ml-1 text-xs text-gray-400">{rating.toFixed(1)}</span>
          </div>
        )}

        {/* Synopsis */}
        {synopsis && (
          <p className="mt-3 text-sm leading-relaxed text-gray-600 line-clamp-4">
            {synopsis}
          </p>
        )}

        {/* Date range */}
        {(startDate || endDate) && (
          <p className="mt-2 text-xs text-gray-400">
            {startDate && <span>Published: {startDate}</span>}
            {startDate && endDate && <span> – </span>}
            {endDate && <span>{endDate}</span>}
          </p>
        )}
      </div>
    </div>
  );
};

export default SeriesHeader;
