import React from 'react';

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
  onItemClick?: (id: string) => void;
  onViewAll?: () => void;
}

const LatestUpdates: React.FC<LatestUpdatesProps> = ({
  title = 'Latest Updates',
  items,
  maxItems = 10,
  showViewAll = false,
  onItemClick,
  onViewAll,
}) => {
  const visible = items.slice(0, maxItems);

  return (
    <section className="py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {showViewAll && onViewAll && (
          <button onClick={onViewAll} className="text-sm text-blue-600 hover:underline">
            View all
          </button>
        )}
      </div>
      {visible.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-400">No updates available.</p>
      )}
      <div className="divide-y divide-gray-100">
        {visible.map((item, idx) => (
          <div
            key={item.id}
            className={`flex cursor-pointer items-start gap-3 py-3 transition-colors hover:bg-gray-50 ${
              idx === 0 ? '' : ''
            }`}
            onClick={() => onItemClick?.(item.id)}
          >
            {item.category && (
              <span className="shrink-0 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                {item.category}
              </span>
            )}
            <span className="flex-1 text-sm leading-snug text-gray-800 line-clamp-2">{item.title}</span>
            <span className="shrink-0 text-xs text-gray-400">{item.publishedAt}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LatestUpdates;
