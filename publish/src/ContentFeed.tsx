import React from 'react';
import type { StackPageRuntimeApi } from './types';

export interface FeedItem {
  id: string;
  title: string;
  publishedAt: string;
  summary?: string;
  category?: string;
  contentType?: string;
}

export interface ContentFeedProps {
  title?: string;
  description?: string;
  items: FeedItem[];
  maxItems?: number;
  groupByDate?: boolean;
  showThumbnails?: boolean;
  selectedContentIdKey?: string;
  __stackpage?: StackPageRuntimeApi;
}

const contentTypeDotColor: Record<string, string> = {
  news: 'border-blue-500 bg-blue-500',
  government: 'border-emerald-500 bg-emerald-500',
  publication: 'border-purple-500 bg-purple-500',
  comic: 'border-orange-500 bg-orange-500',
  entertainment: 'border-pink-500 bg-pink-500',
};

function getDotColor(ct?: string): string {
  if (!ct) return 'border-blue-500 bg-blue-500';
  return contentTypeDotColor[ct] || 'border-blue-500 bg-blue-500';
}

const ContentFeed: React.FC<ContentFeedProps> = ({
  title = 'Updates',
  description,
  items,
  maxItems = 10,
  groupByDate = false,
  __stackpage,
}) => {
  const visible = items.slice(0, maxItems);

  const grouped = groupByDate
    ? visible.reduce<Record<string, FeedItem[]>>((acc, item) => {
        const date = item.publishedAt.split(' ')[0] || 'Unknown';
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
      }, {})
    : null;

  const handleItemClick = (item: FeedItem) => {
    __stackpage?.emit('select', { id: item.id, title: item.title, contentType: item.contentType, source: 'feed' });
  };

  const renderItem = (item: FeedItem) => {
    const dotColor = getDotColor(item.contentType);
    return (
      <div
        key={item.id}
        className="group relative mb-5 cursor-pointer pl-5 last:mb-0"
        onClick={() => handleItemClick(item)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleItemClick(item); } }}
      >
        {/* Timeline dot */}
        <div className={`absolute left-0 top-1 h-2.5 w-2.5 rounded-full border-2 bg-white ${dotColor}`} />
        <span className="mb-0.5 block text-[11px] font-medium text-gray-400">{item.publishedAt}</span>
        <h3 className="text-sm font-semibold leading-snug text-gray-800 group-hover:text-blue-600 transition-colors">
          {item.title}
        </h3>
        {item.summary && (
          <p className="mt-1 text-sm leading-relaxed text-gray-500 line-clamp-2">{item.summary}</p>
        )}
        {item.category && (
          <span className="mt-1.5 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
            {item.category}
          </span>
        )}
      </div>
    );
  };

  return (
    <section className="py-6 sm:py-8">
      {title && (
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-900 md:text-xl">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
        </div>
      )}
      <div className="relative border-l-2 border-gray-100 pl-6">
        {grouped
          ? Object.entries(grouped).map(([date, dateItems]) => (
              <div key={date} className="mb-6 last:mb-0">
                <div className="mb-3 flex items-center gap-2 -ml-[30px]">
                  <div className="h-3 w-3 rounded-full bg-blue-500 ring-4 ring-blue-50" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{date}</span>
                </div>
                <div>{dateItems.map(renderItem)}</div>
              </div>
            ))
          : visible.map(renderItem)}
      </div>
    </section>
  );
};

export default ContentFeed;
