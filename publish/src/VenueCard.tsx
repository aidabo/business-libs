import React from 'react';
import type { StackPageRuntimeApi } from './types';

export interface VenueCardProps {
  name?: string;
  address?: string;
  capacity?: string;
  access?: string;
  parking?: string;
  website?: string;
  phone?: string;
  image?: string;
  mapUrl?: string;
  selectedContentIdKey?: string;
  __stackpage?: StackPageRuntimeApi;
}

const VenueCard: React.FC<VenueCardProps> = ({
  name,
  address,
  capacity,
  access,
  parking,
  website,
  phone,
  image,
  mapUrl,
}) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
      {image && (
        <img src={image} alt={name || 'Venue'} className="mb-3 h-36 w-full rounded-lg object-cover" />
      )}
      {name && <h3 className="text-base font-bold text-gray-900 md:text-lg">{name}</h3>}

      <div className="mt-3 space-y-2 text-sm text-gray-600">
        {address && (
          <div className="flex flex-wrap gap-2">
            <span className="shrink-0 font-medium text-gray-500">Address:</span>
            <span>{address}</span>
          </div>
        )}
        {capacity && (
          <div className="flex flex-wrap gap-2">
            <span className="shrink-0 font-medium text-gray-500">Capacity:</span>
            <span>{capacity}</span>
          </div>
        )}
        {access && (
          <div className="flex flex-wrap gap-2">
            <span className="shrink-0 font-medium text-gray-500">Access:</span>
            <span>{access}</span>
          </div>
        )}
        {parking && (
          <div className="flex flex-wrap gap-2">
            <span className="shrink-0 font-medium text-gray-500">Parking:</span>
            <span>{parking}</span>
          </div>
        )}
        {phone && (
          <div className="flex flex-wrap gap-2">
            <span className="shrink-0 font-medium text-gray-500">Phone:</span>
            <span>{phone}</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {mapUrl && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            View on Map
          </a>
        )}
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200"
          >
            Website ↗
          </a>
        )}
      </div>

      {!name && !address && (
        <div className="flex flex-col items-center py-8 text-gray-400">
          <svg className="mb-2 h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <p className="text-sm">Venue information not available.</p>
        </div>
      )}
    </div>
  );
};

export default VenueCard;
