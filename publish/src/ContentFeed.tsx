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

  const renderItem = (item: FeedItem) => (
    <div
      key={item.id}
      className="group relative mb-6 pl-4 last:mb-0 cursor-pointer"
      onClick={() => handleItemClick(item)}
    >
      <div className="absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-blue-500 bg-white" />
      <span className="mb-0.5 block text-xs text-gray-400">{item.publishedAt}</span>
      <h3 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600">{item.title}</h3>
      {item.summary && (
        <p className="mt-1 text-sm leading-relaxed text-gray-600">{item.summary}</p>
      )}
      {item.category && (
        <span className="mt-1 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
          {item.category}
        </span>
      )}
    </div>
  );

  return (
    <section className="py-6 sm:py-8">
      {title && (
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      )}
      <div className="relative border-l-2 border-gray-200 pl-2">
        {grouped
          ? Object.entries(grouped).map(([date, dateItems]) => (
              <div key={date} className="mb-6">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-xs font-semibold text-gray-500">{date}</span>
                </div>
                <div className="ml-4">{dateItems.map(renderItem)}</div>
              </div>
            ))
          : visible.map(renderItem)}
      </div>
    </section>
  );
};

export default ContentFeed;
