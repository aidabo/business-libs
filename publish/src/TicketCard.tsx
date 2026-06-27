import React from 'react';
import type { StackPageRuntimeApi } from './types';

export interface TicketTier {
  id: string;
  name: string;
  price: string;
  description?: string;
  available: boolean;
  remaining?: number;
  badge?: string;
}

export interface TicketCardProps {
  eventTitle?: string;
  eventDate?: string;
  venue?: string;
  tiers?: TicketTier[];
  purchaseUrl?: string;
  purchaseLabel?: string;
  salesEndDate?: string;
  __stackpage?: StackPageRuntimeApi;
}

const TicketCard: React.FC<TicketCardProps> = ({
  eventTitle,
  eventDate,
  venue,
  tiers = [],
  purchaseUrl,
  purchaseLabel = 'Get Tickets',
  salesEndDate,
}) => {
  return (
    <div className="rounded-lg border border-pink-200 bg-white p-3 sm:p-4">
      {eventTitle && <h3 className="text-base font-bold text-gray-900 md:text-lg">{eventTitle}</h3>}
      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
        {eventDate && <span>📅 {eventDate}</span>}
        {venue && <span>📍 {venue}</span>}
      </div>
      {salesEndDate && (
        <p className="mt-1 text-xs text-amber-600">Sales end: {salesEndDate}</p>
      )}

      {tiers.length > 0 && (
        <div className="mt-3 space-y-2">
          {tiers.map(tier => (
            <div
              key={tier.id}
              className={`rounded-lg border p-3 ${
                tier.available
                  ? 'border-gray-200 bg-white'
                  : 'border-gray-100 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-800">{tier.name}</h4>
                    {tier.badge && (
                      <span className="rounded bg-pink-100 px-1.5 py-0.5 text-xs font-medium text-pink-700">
                        {tier.badge}
                      </span>
                    )}
                  </div>
                  {tier.description && (
                    <p className="text-xs text-gray-500">{tier.description}</p>
                  )}
                </div>
                <span className="shrink-0 text-lg font-bold text-gray-800">{tier.price}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                {tier.available ? (
                  <span className="text-green-600">Available</span>
                ) : (
                  <span className="text-red-500">Sold Out</span>
                )}
                {tier.remaining !== undefined && tier.available && (
                  <span className="text-gray-400">{tier.remaining} remaining</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {purchaseUrl && (
        <a
          href={purchaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block w-full rounded-lg bg-pink-600 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-pink-700"
        >
          {purchaseLabel}
        </a>
      )}

      {tiers.length === 0 && !purchaseUrl && (
        <div className="flex flex-col items-center py-8 text-gray-400">
          <svg className="mb-2 h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <p className="text-sm">No ticket information available.</p>
        </div>
      )}
    </div>
  );
};

export default TicketCard;
