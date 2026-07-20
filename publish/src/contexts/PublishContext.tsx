import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ContentType } from '../types';

export interface PublishContextValue {
  selectedContentId: string | null;
  activeSection: string | null;
  contentTypeFilter: ContentType | 'all';
  searchQuery: string;
  viewMode: 'grid' | 'list' | 'detail';
  setSelectedContentId: (id: string | null) => void;
  setActiveSection: (section: string | null) => void;
  setContentTypeFilter: (ct: ContentType | 'all') => void;
  setSearchQuery: (q: string) => void;
  setViewMode: (mode: 'grid' | 'list' | 'detail') => void;
  t?: (key: string) => string;
}

const PublishContext = createContext<PublishContextValue | undefined>(undefined);

export interface PublishProviderProps {
  children: React.ReactNode;
  t?: (key: string) => string;
}

const fallbackT = (key: string): string => key;

export const PublishProvider: React.FC<PublishProviderProps> = ({ children, t }) => {
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'detail'>('grid');
  const translate = t ?? fallbackT;
  const updateSelectedContentId = useCallback((id: string | null) => setSelectedContentId(id), []);
  const updateActiveSection = useCallback((section: string | null) => setActiveSection(section), []);
  const updateContentTypeFilter = useCallback((ct: ContentType | 'all') => setContentTypeFilter(ct), []);
  const updateSearchQuery = useCallback((q: string) => setSearchQuery(q), []);
  const updateViewMode = useCallback((mode: 'grid' | 'list' | 'detail') => setViewMode(mode), []);

  return (
    <PublishContext.Provider
      value={{
        selectedContentId,
        activeSection,
        contentTypeFilter,
        searchQuery,
        viewMode,
        setSelectedContentId: updateSelectedContentId,
        setActiveSection: updateActiveSection,
        setContentTypeFilter: updateContentTypeFilter,
        setSearchQuery: updateSearchQuery,
        setViewMode: updateViewMode,
        t: translate,
      }}
    >
      {children}
    </PublishContext.Provider>
  );
};

export const usePublishContext = (): PublishContextValue => {
  const ctx = useContext(PublishContext);
  if (!ctx) throw new Error('usePublishContext must be used within PublishProvider');
  return ctx;
};

export const useT = (): ((key: string) => string) => {
  const ctx = useContext(PublishContext);
  return ctx?.t ?? fallbackT;
};
