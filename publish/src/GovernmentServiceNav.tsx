import React, { useState } from 'react';
import type { StackPageRuntimeApi } from './types';

export interface ServiceCategory {
  id: string;
  label: string;
  icon: string;
  description?: string;
  linkUrl?: string;
}

export interface GovernmentServiceNavProps {
  title?: string;
  description?: string;
  services?: ServiceCategory[];
  columns?: 2 | 3 | 4;
  keywordKey?: string;
  __stackpage?: StackPageRuntimeApi;
}

const GovernmentServiceNav: React.FC<GovernmentServiceNavProps> = ({
  title,
  description,
  services = [],
  columns = 3,
  __stackpage,
}) => {
  const [search, setSearch] = useState('');
  const [activeService, setActiveService] = useState<string | null>(null);

  const filtered = search.trim()
    ? services.filter(s =>
        s.label.toLowerCase().includes(search.toLowerCase()) ||
        (s.description || '').toLowerCase().includes(search.toLowerCase())
      )
    : services;

  const handleSelect = (svc: ServiceCategory) => {
    setActiveService(svc.id);
    __stackpage?.emit('select', { id: svc.id, title: svc.label, contentType: 'government', source: 'government-service-nav' });
  };

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  };

  return (
    <div className="rounded-lg bg-white p-3 sm:p-4">
      {title && <h3 className="mb-1 text-base font-bold text-gray-900 md:text-lg">{title}</h3>}
      {description && <p className="mb-4 text-sm text-gray-500">{description}</p>}

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search services..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-gray-400">
          <svg className="mb-2 h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-sm">No services found.</p>
        </div>
      ) : (
        <div className={`grid gap-3 ${gridCols[columns]}`}>
          {filtered.map(svc => (
            <div
              key={svc.id}
              onClick={() => handleSelect(svc)}
              className={`cursor-pointer rounded-lg border p-3 text-center transition-all hover:shadow-sm ${
                activeService === svc.id
                  ? 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-300'
                  : 'border-gray-200 hover:border-emerald-200'
              }`}
            >
              <div className="mb-1 text-2xl">{svc.icon}</div>
              <h4 className="text-sm font-semibold text-gray-800">{svc.label}</h4>
              {svc.description && (
                <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{svc.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GovernmentServiceNav;
