import React from 'react';
import type { StackPageRuntimeApi } from './types';

export interface UpdateItem {
  id: string;
  title: string;
  publishedAt: string;
  category?: string;
  contentType?: string;
}

export interface LatestUpdatesProps {
  title?: string;
  items: UpdateItem[];
  maxItems?: number;
  showViewAll?: boolean;
  selectedContentIdKey?: string;
  __stackpage?: StackPageRuntimeApi;
  onItemClick?: (id: string) => void;
  onViewAll?: () => void;
}

const categoryColors: Record<string, string> = {
  news: 'bg-blue-100 text-blue-700',
  government: 'bg-emerald-100 text-emerald-700',
  publication: 'bg-purple-100 text-purple-700',
  comic: 'bg-orange-100 text-orange-700',
  entertainment: 'bg-pink-100 text-pink-700',
  Business: 'bg-blue-100 text-blue-700',
  Health: 'bg-green-100 text-green-700',
  Politics: 'bg-amber-100 text-amber-700',
  Books: 'bg-purple-100 text-purple-700',
  Events: 'bg-pink-100 text-pink-700',
};

function getCategoryClass(category?: string): string {
  if (!category) return 'bg-gray-100 text-gray-600';
  return categoryColors[category] || 'bg-gray-100 text-gray-600';
}

const LatestUpdates: React.FC<LatestUpdatesProps> = ({
  title = 'Latest Updates',
  items,
  maxItems = 10,
  showViewAll = false,
  __stackpage,
  onItemClick,
  onViewAll,
}) => {
  const visible = items.slice(0, maxItems);

  const handleItemClick = (item: UpdateItem) => {
    __stackpage?.emit('select', { id: item.id, title: item.title, contentType: item.contentType, source: 'latest-updates' });
    onItemClick?.(item.id);
  };

  return (
    <section className="py-6 sm:py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 md:text-xl">{title}</h2>
        {showViewAll && onViewAll && (
          <button onClick={onViewAll} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
            View all →
          </button>
        )}
      </div>
      {visible.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
          No updates available
        </div>
      )}
      <div className="divide-y divide-gray-100 rounded-lg border border-gray-100 bg-white">
        {visible.map((item) => {
          const catClass = getCategoryClass(item.category);
          return (
            <div
              key={item.id}
              className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
              onClick={() => handleItemClick(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleItemClick(item); } }}
            >
              {/* Category badge */}
              {item.category && (
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${catClass}`}>
                  {item.category}
                </span>
              )}
              {!item.category && item.contentType && (
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${getCategoryClass(item.contentType)}`}>
                  {item.contentType}
                </span>
              )}
              <span className="flex-1 text-sm leading-snug text-gray-800 line-clamp-2">{item.title}</span>
              <span className="shrink-0 text-xs text-gray-400">{item.publishedAt}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default LatestUpdates;
