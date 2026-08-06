import React, { useState } from 'react';
import type { StackPageRuntimeApi } from './types';
import { useT } from './contexts/PublishContext';

export interface EventFilterBarProps {
  categories?: { id: string; label: string }[];
  areas?: { id: string; label: string }[];
  keywordKey?: string;
  selectedContentIdKey?: string;
  __stackpage?: StackPageRuntimeApi;
}

export interface EventFilterValues {
  category: string;
  area: string;
  dateFrom: string;
  dateTo: string;
  priceRange: string;
  keyword: string;
}

export const buildEventFilterPayload = (
  current: EventFilterValues,
  overrides: Partial<EventFilterValues> = {},
) => {
  const next = {...current, ...overrides};
  return {
    category: next.category,
    area: next.area,
    dateFrom: next.dateFrom || null,
    dateTo: next.dateTo || null,
    priceRange: next.priceRange,
    keyword: next.keyword || null,
  };
};

const EventFilterBar: React.FC<EventFilterBarProps> = ({
  categories = [],
  areas = [],
  keywordKey = 'publish.searchQuery',
  __stackpage,
}) => {
  const t = useT();
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<string>('all');
  const [activeArea, setActiveArea] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [priceRange, setPriceRange] = useState<string>('all');

  const emitFilter = (overrides: Partial<EventFilterValues> = {}) => {
    __stackpage?.emit('filter-change', buildEventFilterPayload({
      category: activeCat,
      area: activeArea,
      dateFrom,
      dateTo,
      priceRange,
      keyword: search,
    }, overrides));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      __stackpage?.emit('search', {keyword: search, key: keywordKey});
      emitFilter();
    }
  };

  const handleCatChange = (cat: string) => {
    setActiveCat(cat);
    emitFilter({category: cat});
  };

  const handleAreaChange = (area: string) => {
    setActiveArea(area);
    emitFilter({area});
  };

  const clearAll = () => {
    setSearch('');
    setActiveCat('all');
    setActiveArea('all');
    setDateFrom('');
    setDateTo('');
    setPriceRange('all');
    __stackpage?.emit('search', {keyword: '', key: keywordKey});
    emitFilter({
      category: 'all',
      area: 'all',
      dateFrom: '',
      dateTo: '',
      priceRange: 'all',
      keyword: '',
    });
  };

  const hasFilters = activeCat !== 'all' || activeArea !== 'all' || dateFrom || dateTo || priceRange !== 'all' || search;

  return (
    <div className="rounded-lg bg-white p-3 sm:p-4">
      {/* Search */}
      <div className="mb-3">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            onKeyDown={handleSearchSubmit}
            aria-label={t('Search events')}
            placeholder={t('Search broadcasts...')}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-pink-500 focus:outline-none"
          />
        </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-xs font-semibold text-gray-500">{t('Category')}</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleCatChange('all')}
              aria-pressed={activeCat === 'all'}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeCat === 'all' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t('All')}
            </button>
            {categories.map(cat => (
              <button
                type="button"
                key={cat.id}
                onClick={() => handleCatChange(cat.id)}
                aria-pressed={activeCat === cat.id}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activeCat === cat.id ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Area filter */}
      {areas.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-xs font-semibold text-gray-500">{t('Region')}</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleAreaChange('all')}
              aria-pressed={activeArea === 'all'}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeArea === 'all' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t('All regions')}
            </button>
            {areas.map(area => (
              <button
                type="button"
                key={area.id}
                onClick={() => handleAreaChange(area.id)}
                aria-pressed={activeArea === area.id}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activeArea === area.id ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {area.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Date + Price range */}
      <div className="mb-3 flex flex-wrap gap-3">
        <div className="flex-1">
          <label className="mb-0.5 block text-xs font-semibold text-gray-500">{t('From')}</label>
          <input type="date" value={dateFrom} onChange={e => {
            setDateFrom(e.target.value);
            emitFilter({dateFrom: e.target.value});
          }}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-pink-500 focus:outline-none" />
        </div>
        <div className="flex-1">
          <label className="mb-0.5 block text-xs font-semibold text-gray-500">{t('To')}</label>
          <input type="date" value={dateTo} onChange={e => {
            setDateTo(e.target.value);
            emitFilter({dateTo: e.target.value});
          }}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-pink-500 focus:outline-none" />
        </div>
        <div className="flex-1">
          <label className="mb-0.5 block text-xs font-semibold text-gray-500">{t('Price')}</label>
          <select value={priceRange} onChange={e => {
            setPriceRange(e.target.value);
            emitFilter({priceRange: e.target.value});
          }}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-pink-500 focus:outline-none">
            <option value="all">{t('Any price')}</option>
            <option value="free">{t('Free')}</option>
            <option value="under50">{t('Under $50')}</option>
            <option value="50to100">{t('$50-$100')}</option>
            <option value="over100">{t('Over $100')}</option>
          </select>
        </div>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs font-medium text-gray-500 hover:text-gray-700 hover:underline"
        >
          {t('Clear all filters')}
        </button>
      )}
    </div>
  );
};

export default EventFilterBar;
