import React from 'react';

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
  onSelectChapter?: (chapterId: string) => void;
}

const ChapterList: React.FC<ChapterListProps> = ({
  seriesName,
  chapters,
  currentChapter,
  onSelectChapter,
}) => {
  const sorted = [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);

  return (
    <section className="py-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">{seriesName}</h2>
        <p className="text-sm text-gray-500">{chapters.length} chapters</p>
      </div>
      {sorted.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-400">No chapters available.</p>
      )}
      <div className="divide-y divide-gray-100">
        {sorted.map((ch) => (
          <div
            key={ch.id}
            className={`flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors hover:bg-gray-50 ${
              currentChapter === ch.chapterNumber ? 'bg-blue-50' : ''
            }`}
            onClick={() => onSelectChapter?.(ch.id)}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
              {ch.chapterNumber}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`text-sm ${currentChapter === ch.chapterNumber ? 'font-semibold text-blue-700' : 'text-gray-800'}`}>
                Ch. {ch.chapterNumber}: {ch.title}
              </p>
              <p className="text-xs text-gray-400">{ch.pageCount} pages · {ch.publishedAt}</p>
            </div>
            {currentChapter === ch.chapterNumber && (
              <span className="shrink-0 text-xs font-medium text-blue-600">Reading</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ChapterList;
