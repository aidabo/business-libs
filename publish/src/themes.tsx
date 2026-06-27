import type { ContentType, WritingMode } from './types';

export interface VerticalTheme {
  name: string;
  icon: string;
  primary: string;
  primaryBg: string;
  accent: string;
  badgeBg: string;
  badgeText: string;
  cardBorder?: string;
  cardBg?: string;
  hoverAccent?: string;
  writingMode?: WritingMode;
}

const verticalThemes: Record<ContentType, VerticalTheme> = {
  news: {
    name: 'News',
    icon: '📰',
    primary: 'text-blue-700',
    primaryBg: 'bg-blue-600',
    accent: 'text-red-500',
    badgeBg: 'bg-blue-600',
    badgeText: 'text-white',
    cardBorder: 'border-l-4 border-l-blue-500',
    hoverAccent: 'hover:text-blue-600',
    writingMode: 'horizontal-tb',
  },
  government: {
    name: 'Government',
    icon: '🏛️',
    primary: 'text-emerald-700',
    primaryBg: 'bg-emerald-600',
    accent: 'text-amber-600',
    badgeBg: 'bg-emerald-600',
    badgeText: 'text-white',
    cardBorder: 'border-l-4 border-l-emerald-500',
    hoverAccent: 'hover:text-emerald-600',
    writingMode: 'horizontal-tb',
  },
  publication: {
    name: 'Books',
    icon: '📚',
    primary: 'text-purple-700',
    primaryBg: 'bg-purple-600',
    accent: 'text-amber-500',
    badgeBg: 'bg-purple-600',
    badgeText: 'text-white',
    cardBorder: 'border-l-4 border-l-purple-500',
    hoverAccent: 'hover:text-purple-600',
    writingMode: 'vertical-rl',
  },
  comic: {
    name: 'Manga',
    icon: '🎨',
    primary: 'text-orange-700',
    primaryBg: 'bg-orange-600',
    accent: 'text-red-400',
    badgeBg: 'bg-orange-600',
    badgeText: 'text-white',
    cardBorder: 'border-l-4 border-l-orange-500',
    hoverAccent: 'hover:text-orange-600',
    writingMode: 'vertical-rl',
  },
  entertainment: {
    name: 'Events',
    icon: '🎪',
    primary: 'text-pink-700',
    primaryBg: 'bg-pink-600',
    accent: 'text-teal-500',
    badgeBg: 'bg-pink-600',
    badgeText: 'text-white',
    cardBorder: 'border-l-4 border-l-pink-500',
    hoverAccent: 'hover:text-pink-600',
    writingMode: 'horizontal-tb',
  },
};

export function getVerticalTheme(contentType?: ContentType | string | null): VerticalTheme {
  if (contentType && contentType in verticalThemes) {
    return verticalThemes[contentType as ContentType];
  }
  return {
    name: 'General',
    icon: '📄',
    primary: 'text-gray-700',
    primaryBg: 'bg-gray-600',
    accent: 'text-gray-500',
    badgeBg: 'bg-gray-600',
    badgeText: 'text-white',
    cardBorder: 'border-l-4 border-l-gray-400',
    hoverAccent: 'hover:text-gray-600',
  };
}

/** CSS class for the primary color dot / divider used in specialist cards */
export function verticalDotClass(contentType?: ContentType | string | null): string {
  const map: Record<string, string> = {
    news: 'bg-blue-500',
    government: 'bg-emerald-500',
    publication: 'bg-purple-500',
    comic: 'bg-orange-500',
    entertainment: 'bg-pink-500',
  };
  if (contentType && contentType in map) return map[contentType as string];
  return 'bg-gray-400';
}

/** Section header with vertical-themed accent bar */
export const VerticalSectionHeader: React.FC<{
  icon: string;
  title: string;
  subtitle?: string;
}> = ({ icon, title, subtitle }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2">
      <span className="text-xl">{icon}</span>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    </div>
    {subtitle && <p className="mt-1 ml-9 text-sm text-gray-500">{subtitle}</p>}
  </div>
);

/** Get the default writing mode for a content type */
export function getDefaultWritingMode(contentType?: ContentType | string | null): WritingMode {
  if (contentType && contentType in verticalThemes) {
    return verticalThemes[contentType as ContentType].writingMode ?? 'horizontal-tb';
  }
  return 'horizontal-tb';
}

export default verticalThemes;
