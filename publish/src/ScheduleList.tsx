import React, { useState, useMemo } from 'react';
import type { StackPageRuntimeApi } from './types';

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  speaker?: string;
  location?: string;
  description?: string;
  track?: string;
}

export interface ScheduleListProps {
  title?: string;
  date?: string;
  items?: ScheduleItem[];
  showTrackFilter?: boolean;
  tracks?: string[];
  selectedContentIdKey?: string;
  __stackpage?: StackPageRuntimeApi;
}

const ScheduleList: React.FC<ScheduleListProps> = ({
  title,
  date,
  items = [],
  showTrackFilter = true,
  tracks,
  __stackpage,
}) => {
  const [activeTrack, setActiveTrack] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allTracks = useMemo(() => {
    if (tracks && tracks.length > 0) return tracks;
    return Array.from(new Set(items.map(i => i.track).filter(Boolean))) as string[];
  }, [tracks, items]);

  const sorted = useMemo(() => {
    let filtered = items;
    if (activeTrack !== 'all') {
      filtered = filtered.filter(i => i.track === activeTrack);
    }
    return filtered.sort((a, b) => a.time.localeCompare(b.time));
  }, [items, activeTrack]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleSelect = (item: ScheduleItem) => {
    __stackpage?.emit('select', { id: item.id, title: item.title, contentType: 'entertainment', source: 'schedule-list' });
  };

  return (
    <div className="rounded-lg bg-white p-3 sm:p-4">
      {title && <h3 className="text-base font-bold text-gray-900 md:text-lg">{title}</h3>}
      {date && <p className="text-sm text-gray-500">{date}</p>}

      {showTrackFilter && allTracks.length > 0 && (
        <div className="mb-3 mt-2 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTrack('all')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeTrack === 'all' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {allTracks.map(track => (
            <button
              key={track}
              onClick={() => setActiveTrack(track)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeTrack === track ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {track}
            </button>
          ))}
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-gray-400">
          <svg className="mb-2 h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm">No schedule items.</p>
        </div>
      ) : (
        <div className="relative ml-2 space-y-0">
          {sorted.map((item, idx) => {
            const isExpanded = expandedId === item.id;
            const isLast = idx === sorted.length - 1;
            return (
              <div key={item.id} className="relative flex gap-3 pb-3">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className="z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-pink-400 bg-white">
                    <div className="h-2 w-2 rounded-full bg-pink-400" />
                  </div>
                  {!isLast && <div className="w-0.5 flex-1 bg-pink-100" />}
                </div>
                {/* Content */}
                <div
                  onClick={() => { handleSelect(item); toggleExpand(item.id); }}
                  className={`min-w-0 flex-1 cursor-pointer rounded-lg border p-3 transition-colors ${
                    isExpanded ? 'border-pink-200 bg-pink-50' : 'border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-semibold text-pink-600">{item.time}</span>
                      <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {item.track && (
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">{item.track}</span>
                      )}
                      {item.location && (
                        <span className="hidden text-xs text-gray-400 sm:inline">{item.location}</span>
                      )}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-2 border-t border-gray-100 pt-2">
                      {item.speaker && (
                        <p className="text-xs font-medium text-gray-700">Speaker: {item.speaker}</p>
                      )}
                      {item.description && (
                        <p className="mt-1 text-xs text-gray-500">{item.description}</p>
                      )}
                      {item.location && (
                        <p className="mt-1 text-xs text-gray-400 sm:hidden">📍 {item.location}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScheduleList;
