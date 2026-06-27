import React, { useState, useMemo } from 'react';
import type { StackPageRuntimeApi } from './types';

export interface CouncilSession {
  id: string;
  date: string;
  title: string;
  status: 'upcoming' | 'in-session' | 'adjourned' | 'cancelled';
  time?: string;
  location?: string;
  agenda?: string[];
  committee?: string;
}

export interface CouncilScheduleProps {
  title?: string;
  sessions?: CouncilSession[];
  maxItems?: number;
  showAgenda?: boolean;
  selectedContentIdKey?: string;
  __stackpage?: StackPageRuntimeApi;
}

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  upcoming: { label: 'Upcoming', bg: 'bg-blue-100', text: 'text-blue-700' },
  'in-session': { label: 'In Session', bg: 'bg-green-100', text: 'text-green-700' },
  adjourned: { label: 'Adjourned', bg: 'bg-gray-100', text: 'text-gray-600' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-700' },
};

const CouncilSchedule: React.FC<CouncilScheduleProps> = ({
  title,
  sessions = [],
  maxItems = 20,
  showAgenda: _showAgenda = false,
  __stackpage,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    return [...sessions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, maxItems);
  }, [sessions, maxItems]);

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
      });
    } catch { return d; }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleSelect = (session: CouncilSession) => {
    __stackpage?.emit('select', { id: session.id, title: session.title, contentType: 'government', source: 'council-schedule' });
  };

  return (
    <div className="rounded-lg bg-white p-3 sm:p-4">
      {title && <h3 className="mb-3 text-base font-bold text-gray-900 md:text-lg">{title}</h3>}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-gray-400">
          <svg className="mb-2 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">No scheduled sessions.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(session => {
            const statusStyle = STATUS_STYLES[session.status] || STATUS_STYLES.upcoming;
            const isExpanded = expandedId === session.id;
            return (
              <div
                key={session.id}
                className="rounded-lg border border-gray-200 transition-shadow hover:shadow-sm"
              >
                <div
                  onClick={() => { handleSelect(session); toggleExpand(session.id); }}
                  className="flex cursor-pointer items-start justify-between p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-gray-900">{session.title}</h4>
                      <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                        {statusStyle.label}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span>{formatDate(session.date)}</span>
                      {session.time && <span>{session.time}</span>}
                      {session.committee && <span className="rounded bg-gray-100 px-1.5 py-0.5">{session.committee}</span>}
                    </div>
                  </div>
                  <svg className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {isExpanded && session.agenda && session.agenda.length > 0 && (
                  <div className="border-t border-gray-100 px-3 pb-3 pt-2">
                    <p className="mb-1 text-xs font-semibold text-gray-600">Agenda:</p>
                    <ul className="list-inside list-disc space-y-0.5 text-xs text-gray-500">
                      {session.agenda.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                    {session.location && (
                      <p className="mt-2 text-xs text-gray-400">📍 {session.location}</p>
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

export default CouncilSchedule;
