import React from 'react';
import type { Section } from './types';
import type { StackPageRuntimeApi } from './types';

export interface SectionNavProps {
  sections: Section[];
  activeSection?: string | null;
  showCounts?: boolean;
  __stackpage?: StackPageRuntimeApi;
  onSelect?: (section: string | null) => void;
  keywordKey?: string;
}

const SectionNav: React.FC<SectionNavProps> = ({
  sections,
  activeSection,
  showCounts = false,
  __stackpage,
  onSelect,
}) => {
  const handleSelect = (slug: string | null) => {
    __stackpage?.emit('section-change', { section: slug });
    onSelect?.(slug);
  };

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2">
        <button
          onClick={() => handleSelect(null)}
          className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !activeSection
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => handleSelect(sec.slug)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeSection === sec.slug
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {sec.icon && <span>{sec.icon}</span>}
            <span>{sec.name}</span>
            {showCounts && sec.count !== undefined && (
              <span className="text-xs opacity-70">({sec.count})</span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default SectionNav;
