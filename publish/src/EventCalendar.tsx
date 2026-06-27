import React, { useState, useMemo } from 'react';
import type { StackPageRuntimeApi } from './types';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  category?: string;
  location?: string;
}

export interface EventCalendarProps {
  title?: string;
  events?: CalendarEvent[];
  selectedContentIdKey?: string;
  __stackpage?: StackPageRuntimeApi;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const EventCalendar: React.FC<EventCalendarProps> = ({
  title,
  events = [],
  __stackpage,
}) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [viewYear, viewMonth, firstDayOfWeek, daysInMonth]);

  const eventMap = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    events.forEach(ev => {
      try {
        const day = new Date(ev.date).getDate();
        const existing = map.get(day) || [];
        existing.push(ev);
        map.set(day, existing);
      } catch { /* skip invalid dates */ }
    });
    return map;
  }, [events]);

  const selectedEvents = selectedDay !== null ? (eventMap.get(selectedDay) || []) : [];
  const hasEvent = (day: number) => (eventMap.get(day)?.length || 0) > 0;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  };

  const handleSelect = (ev: CalendarEvent) => {
    __stackpage?.emit('select', { id: ev.id, title: ev.title, contentType: 'entertainment', source: 'event-calendar' });
  };

  return (
    <div className="rounded-lg bg-white p-3 sm:p-4">
      {title && <h3 className="mb-3 text-base font-bold text-gray-900 md:text-lg">{title}</h3>}

      {/* Month navigation */}
      <div className="mb-3 flex items-center justify-between">
        <button onClick={prevMonth} className="rounded p-1 text-gray-500 hover:bg-gray-100">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-base font-bold text-gray-800">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} className="rounded p-1 text-gray-500 hover:bg-gray-100">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-1 text-center min-w-[280px]">
        {WEEKDAYS.map(wd => (
          <div key={wd} className="py-1 text-xs font-semibold text-gray-500">{wd}</div>
        ))}
        {calendarDays.map((day, i) => (
          <div key={i} className="aspect-square">
            {day !== null ? (
              <button
                onClick={() => setSelectedDay(day)}
                className={`flex h-full w-full items-center justify-center rounded-lg text-sm transition-colors ${
                  selectedDay === day
                    ? 'bg-pink-600 text-white'
                    : hasEvent(day)
                      ? 'bg-pink-50 font-semibold text-pink-700 hover:bg-pink-100'
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="relative">
                  {day}
                  {hasEvent(day) && selectedDay !== day && (
                    <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-pink-500" />
                  )}
                </div>
              </button>
            ) : (
              <div />
            )}
          </div>
        ))}
        </div>
      </div>

      {/* Selected day events */}
      {selectedDay !== null && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="mb-2 text-xs font-semibold text-gray-500">
            Events on {MONTHS[viewMonth]} {selectedDay}
          </p>
          {selectedEvents.length === 0 ? (
            <p className="text-xs text-gray-400">No events on this day.</p>
          ) : (
            <div className="space-y-1">
              {selectedEvents.map(ev => (
                <div
                  key={ev.id}
                  onClick={() => handleSelect(ev)}
                  className="cursor-pointer rounded bg-pink-50 px-2 py-1.5 text-sm hover:bg-pink-100"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">{ev.title}</span>
                    {ev.time && <span className="text-xs text-gray-500">{ev.time}</span>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {ev.location && <span>{ev.location}</span>}
                    {ev.category && <span className="rounded bg-white px-1 py-0.5">{ev.category}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventCalendar;
