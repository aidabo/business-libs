import React, { useState, useMemo } from 'react';
import type { StackPageRuntimeApi } from './types';

export interface DocumentItem {
  id: string;
  title: string;
  issuingAuthority: string;
  documentDate: string;
  documentType?: string;
  fileUrl?: string;
  fileSize?: string;
  urgent?: boolean;
  category?: string;
}

export interface DocumentListProps {
  title?: string;
  description?: string;
  documents?: DocumentItem[];
  showSearch?: boolean;
  searchPlaceholder?: string;
  showCategoryFilter?: boolean;
  categories?: string[];
  maxItems?: number;
  keywordKey?: string;
  selectedContentIdKey?: string;
  __stackpage?: StackPageRuntimeApi;
}

const DocumentList: React.FC<DocumentListProps> = ({
  title,
  description,
  documents = [],
  showSearch = true,
  searchPlaceholder = 'Search documents...',
  showCategoryFilter = true,
  categories,
  maxItems = 20,
  __stackpage,
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const allCategories = useMemo(() => {
    if (categories && categories.length > 0) return categories;
    const cats = new Set(documents.map(d => d.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [categories, documents]);

  const filtered = useMemo(() => {
    let items = documents;
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.issuingAuthority.toLowerCase().includes(q) ||
        (d.category || '').toLowerCase().includes(q)
      );
    }
    if (activeCategory !== 'all') {
      items = items.filter(d => d.category === activeCategory);
    }
    return items.slice(0, maxItems);
  }, [documents, search, activeCategory, maxItems]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    __stackpage?.emit('search', { keyword: val, key: 'publish.searchQuery' });
  };

  const handleSelect = (doc: DocumentItem) => {
    __stackpage?.emit('select', { id: doc.id, title: doc.title, contentType: 'government', source: 'document-list' });
  };

  return (
    <div className="rounded-lg bg-white p-3 sm:p-4">
      {title && <h3 className="mb-1 text-base font-bold text-gray-900 md:text-lg">{title}</h3>}
      {description && <p className="mb-4 text-sm text-gray-500">{description}</p>}

      {showSearch && (
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>
      )}

      {showCategoryFilter && allCategories.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-gray-400">
          <svg className="mb-2 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">No documents match your search.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(doc => (
            <div
              key={doc.id}
              onClick={() => handleSelect(doc)}
              className={`cursor-pointer rounded-lg border p-3 transition-shadow hover:shadow-sm ${
                doc.urgent ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="truncate text-sm font-semibold text-gray-900">{doc.title}</h4>
                    {doc.urgent && (
                      <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-700">
                        URGENT
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">{doc.issuingAuthority}</p>
                </div>
                {doc.category && (
                  <span className="shrink-0 rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    {doc.category}
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                <span>{doc.documentDate}</span>
                {doc.documentType && <span>{doc.documentType}</span>}
                {doc.fileSize && <span>{doc.fileSize}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList;
