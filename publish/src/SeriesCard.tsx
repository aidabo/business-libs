import React from 'react';
import type { StackPageRuntimeApi } from './types';

export interface SeriesVolume {
  id: string;
  number: number;
  title: string;
  coverImage?: string;
  publishedAt?: string;
  pageCount?: number;
}

export interface SeriesCardProps {
  title?: string;
  author?: string;
  description?: string;
  volumes?: SeriesVolume[];
  totalVolumes?: number;
  currentVolume?: number;
  selectedContentIdKey?: string;
  __stackpage?: StackPageRuntimeApi;
}

const SeriesCard: React.FC<SeriesCardProps> = ({
  title,
  author,
  description,
  volumes = [],
  totalVolumes,
  currentVolume,
  selectedContentIdKey,
  __stackpage,
}) => {
  const handleSelect = (vol: SeriesVolume) => {
    const payload = { id: vol.id, title: `${title} Vol.${vol.number}`, contentType: 'publication' };
    // Set shared state for cross-component selection
    if (selectedContentIdKey) {
      __stackpage?.setPageState?.(selectedContentIdKey, vol.id);
      __stackpage?.setState?.(selectedContentIdKey, vol.id);
    }
    // Emit selection event
    __stackpage?.emit('select', { ...payload, source: 'series-card' });
  };

  return (
    <div className="rounded-lg border border-purple-200 bg-white p-3 sm:p-4">
      {title && <h3 className="text-base font-bold text-gray-900 md:text-lg">{title}</h3>}
      {author && <p className="text-sm text-gray-500">{author}</p>}
      {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}

      {(totalVolumes || currentVolume) && (
        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
          {totalVolumes && <span>Total: {totalVolumes} volumes</span>}
          {currentVolume && (
            <span className="rounded bg-purple-100 px-2 py-0.5 font-medium text-purple-700">
              Current: Vol.{currentVolume}
            </span>
          )}
        </div>
      )}

      {volumes.length > 0 && (
        <div className="mt-3 space-y-1">
          {volumes.map(vol => (
            <div
              key={vol.id}
              onClick={() => handleSelect(vol)}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-100 p-2 transition-colors hover:bg-purple-50"
            >
              {vol.coverImage && (
                <img src={vol.coverImage} alt={vol.title} className="h-12 w-9 shrink-0 rounded object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800">
                  Vol.{vol.number}: {vol.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  {vol.publishedAt && <span>{vol.publishedAt}</span>}
                  {vol.pageCount && <span>{vol.pageCount}p</span>}
                </div>
              </div>
              <svg className="h-4 w-4 shrink-0 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </div>
      )}

      {volumes.length === 0 && !title && (
        <div className="flex flex-col items-center py-8 text-gray-400">
          <svg className="mb-2 h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-sm">No volumes available.</p>
        </div>
      )}
    </div>
  );
};

export default SeriesCard;
