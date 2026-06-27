import React from 'react';
import ContentCard from './ContentCard';
import type { PublishContent, ContentType } from './types';
import type { StackPageRuntimeApi } from './types';

export interface ContentGridProps {
  title?: string;
  description?: string;
  contents: PublishContent[];
  columns?: 1 | 2 | 3 | 4;
  featuredFirst?: boolean;
  contentTypeFilter?: ContentType | 'all';
  selectedContentIdKey?: string;
  viewAllUrl?: string;
  viewAllLabel?: string;
  __stackpage?: StackPageRuntimeApi;
}

const ContentGrid: React.FC<ContentGridProps> = ({
  title,
  description,
  contents,
  columns = 3,
  featuredFirst = true,
  contentTypeFilter = 'all',
  selectedContentIdKey,
  viewAllUrl,
  viewAllLabel = 'View all',
  __stackpage,
}) => {
  const gridCols: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  const filtered = contentTypeFilter === 'all'
    ? contents
    : contents.filter((c) => c.contentType === contentTypeFilter);

  const sorted = featuredFirst
    ? [...filtered].sort((a, b) => Number(b.featured) - Number(a.featured))
    : filtered;

  if (sorted.length === 0) {
    return (
      <section className="py-6">
        {title && <h2 className="mb-4 text-lg font-bold text-gray-900">{title}</h2>}
        <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 py-12 text-center text-sm text-gray-400">
          <svg className="mx-auto mb-2 h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p>No content available</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 md:py-6">
      {(title || viewAllUrl) && (
        <div className="mb-3 flex items-end justify-between md:mb-4">
          <div>
            {title && <h2 className="text-lg font-bold text-gray-900 md:text-xl">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
          </div>
          {viewAllUrl && (
            <a
              href={viewAllUrl}
              className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              {viewAllLabel} →
            </a>
          )}
        </div>
      )}
      <div className={`grid gap-3 sm:gap-4 md:gap-5 ${gridCols[columns]}`}>
        {sorted.map((item) => (
          <div key={item.id}>
            <ContentCard
              title={item.title}
              excerpt={item.excerpt}
              image={item.image}
              contentType={item.contentType}
              category={item.category}
              author={item.author}
              publishedAt={item.publishedAt}
              featured={item.featured}
              format={item.format}
              price={item.price}
              seriesName={item.seriesName}
              chapterNumber={item.chapterNumber}
              selectedContentIdKey={selectedContentIdKey}
              __stackpage={__stackpage}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ContentGrid;
