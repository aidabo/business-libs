import React, { useState } from 'react';
import type { StackPageRuntimeApi } from './types';

export interface EventFilterBarProps {
  categories?: { id: string; label: string }[];
  areas?: { id: string; label: string }[];
  keywordKey?: string;
  selectedContentIdKey?: string;
  __stackpage?: StackPageRuntimeApi;
}

const EventFilterBar: React.FC<EventFilterBarProps> = ({
  categories = [],
  areas = [],
  __stackpage,
}) => {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<string>('all');
  const [activeArea, setActiveArea] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [priceRange, setPriceRange] = useState<string>('all');

  const emitFilter = () => {
    __stackpage?.emit('filter-change', {
      category: activeCat,
      area: activeArea,
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
      priceRange,
      keyword: search || null,
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      __stackpage?.emit('search', { keyword: search, key: 'publish.searchQuery' });
      emitFilter();
    }
  };

  const handleCatChange = (cat: string) => {
    setActiveCat(cat);
    setTimeout(emitFilter, 0);
  };

  const handleAreaChange = (area: string) => {
    setActiveArea(area);
    setTimeout(emitFilter, 0);
  };

  const clearAll = () => {
    setSearch('');
    setActiveCat('all');
    setActiveArea('all');
    setDateFrom('');
    setDateTo('');
    setPriceRange('all');
    __stackpage?.emit('search', { keyword: '', key: 'publish.searchQuery' });
    __stackpage?.emit('filter-change', { category: 'all', area: 'all', dateFrom: null, dateTo: null, priceRange: 'all', keyword: null });
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
          placeholder="Search events..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-pink-500 focus:outline-none"
        />
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-xs font-semibold text-gray-500">Category</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleCatChange('all')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeCat === 'all' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCatChange(cat.id)}
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
          <p className="mb-1 text-xs font-semibold text-gray-500">Area</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleAreaChange('all')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeArea === 'all' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Areas
            </button>
            {areas.map(area => (
              <button
                key={area.id}
                onClick={() => handleAreaChange(area.id)}
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
          <label className="mb-0.5 block text-xs font-semibold text-gray-500">From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-pink-500 focus:outline-none" />
        </div>
        <div className="flex-1">
          <label className="mb-0.5 block text-xs font-semibold text-gray-500">To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-pink-500 focus:outline-none" />
        </div>
        <div className="flex-1">
          <label className="mb-0.5 block text-xs font-semibold text-gray-500">Price</label>
          <select value={priceRange} onChange={e => setPriceRange(e.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-pink-500 focus:outline-none">
            <option value="all">Any Price</option>
            <option value="free">Free</option>
            <option value="under50">Under $50</option>
            <option value="50to100">$50–$100</option>
            <option value="over100">Over $100</option>
          </select>
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="text-xs font-medium text-gray-500 hover:text-gray-700 hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
};

export default EventFilterBar;
