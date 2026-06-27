import React from 'react';
import type { StackPageRuntimeApi } from './types';

export interface EventCardProps {
  title: string;
  description?: string;
  image?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  category?: string;
  price?: string;
  ticketUrl?: string;
  __stackpage?: StackPageRuntimeApi;
}

const EventCard: React.FC<EventCardProps> = ({
  title,
  description,
  image,
  startDate,
  endDate,
  location,
  category,
  price,
  ticketUrl,
  __stackpage,
}) => {
  const isPast = startDate ? new Date(startDate) < new Date() : false;
  const handleClick = () => {
    __stackpage?.emit('select', { id: '', title, source: 'event-card' });
  };

  const dateStr = startDate
    ? endDate && endDate !== startDate
      ? `${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      : new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md border-t-[3px] border-t-pink-500 ${
        isPast ? 'opacity-60' : ''
      }`}
      onClick={handleClick}
    >
      {image && (
        <div className="relative w-full overflow-hidden aspect-[16/9]">
          <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover" />
          {category && (
            <span className="absolute left-3 top-3 rounded bg-pink-600 px-2 py-0.5 text-xs font-semibold text-white">
              {category}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium text-pink-600">{dateStr}</span>
          {price && <span className="ml-auto font-bold text-gray-800">{price}</span>}
        </div>
        <h3 className="mb-1.5 text-base font-semibold leading-snug text-gray-900 group-hover:text-pink-600">
          {title}
        </h3>
        {description && (
          <p className="mb-3 text-sm leading-relaxed text-gray-600 line-clamp-2">{description}</p>
        )}
        <div className="mt-auto flex items-center justify-between text-xs text-gray-400">
          {location && (
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {location}
            </span>
          )}
          {ticketUrl && (
            <a
              href={ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-pink-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Tickets
            </a>
          )}
        </div>
      </div>
    </article>
  );
};

export default EventCard;
