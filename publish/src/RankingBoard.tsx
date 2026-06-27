import React from 'react';
import type { StackPageRuntimeApi } from './types';

export interface RankingItem {
  id: string;
  rank: number;
  title: string;
  author?: string;
  coverImage?: string;
  rating?: number;
  previousRank?: number;
  badge?: string;
}

export interface RankingBoardProps {
  title?: string;
  description?: string;
  items?: RankingItem[];
  category?: string;
  maxItems?: number;
  selectedContentIdKey?: string;
  __stackpage?: StackPageRuntimeApi;
}

const RANK_COLORS: Record<number, { bg: string; border: string; text: string; medal: string }> = {
  1: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-800', medal: '🥇' },
  2: { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-700', medal: '🥈' },
  3: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-800', medal: '🥉' },
};

const getRankColor = (rank: number) => RANK_COLORS[rank] || { bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-600', medal: '' };

const RankingBoard: React.FC<RankingBoardProps> = ({
  title,
  description,
  items = [],
  category,
  maxItems = 10,
  __stackpage,
}) => {
  const displayItems = items.slice(0, maxItems);

  const handleSelect = (item: RankingItem) => {
    __stackpage?.emit('select', { id: item.id, title: item.title, contentType: 'publication', source: 'ranking-board' });
  };

  return (
    <div className="rounded-lg bg-white p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          {title && <h3 className="text-base font-bold text-gray-900 md:text-lg">{title}</h3>}
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
        {category && (
          <span className="rounded bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700">
            {category}
          </span>
        )}
      </div>

      {displayItems.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-gray-400">
          <svg className="mb-2 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm">No ranking data available.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {displayItems.map(item => {
            const rankColor = getRankColor(item.rank);
            return (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-shadow hover:shadow-sm sm:gap-3 sm:p-3 ${rankColor.bg} ${rankColor.border}`}
              >
                {/* Rank badge */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center sm:h-9 sm:w-9">
                  {item.rank <= 3 ? (
                    <span className="text-xl">{rankColor.medal}</span>
                  ) : (
                    <span className={`text-sm font-bold ${rankColor.text}`}>#{item.rank}</span>
                  )}
                </div>
                {/* Cover */}
                {item.coverImage && (
                  <img src={item.coverImage} alt={item.title} className="h-12 w-9 shrink-0 rounded object-cover" />
                )}
                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="truncate text-sm font-semibold text-gray-900">{item.title}</h4>
                    {item.badge && (
                      <span className="shrink-0 rounded bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-700">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {item.author && <span>{item.author}</span>}
                    {item.rating && <span>★ {item.rating.toFixed(1)}</span>}
                  </div>
                </div>
                {/* Rank change */}
                {item.previousRank !== undefined && (
                  <div className="shrink-0 text-xs">
                    {item.previousRank > item.rank ? (
                      <span className="text-green-600">▲ {item.previousRank - item.rank}</span>
                    ) : item.previousRank < item.rank ? (
                      <span className="text-red-600">▼ {item.rank - item.previousRank}</span>
                    ) : (
                      <span className="text-gray-400">―</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RankingBoard;
