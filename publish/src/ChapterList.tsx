import React from 'react';
import type { StackPageRuntimeApi } from './types';

export interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  pageCount: number;
  publishedAt: string;
}

export interface ChapterListProps {
  seriesName: string;
  chapters: Chapter[];
  currentChapter?: number;
  selectedContentIdKey?: string;
  __stackpage?: StackPageRuntimeApi;
  onSelectChapter?: (chapterId: string) => void;
}

const ChapterList: React.FC<ChapterListProps> = ({
  seriesName,
  chapters,
  currentChapter,
  __stackpage,
  onSelectChapter,
}) => {
  const sorted = [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
  const maxChapter = sorted.length > 0 ? Math.max(...sorted.map(c => c.chapterNumber)) : 1;

  const handleSelect = (ch: Chapter) => {
    __stackpage?.emit('select', { id: ch.id, title: `Ch.${ch.chapterNumber}: ${ch.title}`, contentType: 'comic', source: 'chapter-list' });
    onSelectChapter?.(ch.id);
  };

  return (
    <section className="py-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 md:text-xl">{seriesName}</h2>
        <p className="text-sm text-gray-400">{chapters.length} chapters</p>
      </div>
      {sorted.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
          No chapters available.
        </div>
      )}
      <div className="divide-y divide-gray-100 rounded-lg border border-gray-100 bg-white">
        {sorted.map((ch) => {
          const isCurrent = currentChapter === ch.chapterNumber;
          const progressPct = Math.round((ch.chapterNumber / maxChapter) * 100);
          return (
            <div
              key={ch.id}
              className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                isCurrent ? 'bg-orange-50 hover:bg-orange-50/80' : ''
              }`}
              onClick={() => handleSelect(ch)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(ch); } }}
            >
              {/* Chapter number badge */}
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                isCurrent
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {ch.chapterNumber}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${
                  isCurrent ? 'text-orange-800' : 'text-gray-800'
                }`}>
                  Ch. {ch.chapterNumber}: {ch.title}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                  <span>{ch.pageCount}p</span>
                  <span>·</span>
                  <span>{ch.publishedAt}</span>
                </div>
                {/* Reading progress bar */}
                <div className="mt-1.5 h-1 w-full rounded-full bg-gray-100">
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${
                      isCurrent ? 'bg-orange-400' : 'bg-gray-300'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
              {isCurrent && (
                <span className="shrink-0 rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-semibold text-orange-700">
                  Reading
                </span>
              )}
              {!isCurrent && (
                <svg className="h-4 w-4 shrink-0 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ChapterList;
