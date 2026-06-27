import React from 'react';
import type { StackPageRuntimeApi } from './types';

export interface NewspaperHeaderProps {
  /** Newspaper/masthead name */
  name: string;
  /** Tagline / motto (e.g. "All the News That's Fit to Print") */
  tagline?: string;
  /** Publication date (auto-set to today if omitted) */
  date?: string;
  /** Edition / volume number (e.g. "第12345号") */
  edition?: string;
  /** Weather widget data */
  weather?: {
    city: string;
    temp: string;
    icon?: string;
    condition?: string;
  };
  /** Section navigation links */
  sections?: { label: string; slug: string }[];
  /** Logo image URL (replaces text nameplate when set) */
  logoImage?: string;
  /** Layout variant */
  variant?: 'standard' | 'compact';
  /** Active section slug (highlighted in nav) */
  activeSection?: string;

  // StackPage integration
  __stackpage?: StackPageRuntimeApi;
  onSectionClick?: (slug: string) => void;
}

/**
 * NewspaperHeader — 報頭 (paper nameplate).
 *
 * Professional newspaper masthead with:
 * - Top bar: weather, edition number, date
 * - Nameplate: newspaper name (text or logo image) with tagline
 * - Section navigation bar
 *
 * Two variants:
 * - `standard` (default): full layout with top bar + nameplate + tagline + section nav
 * - `compact`: minimal layout — name + date + section nav only
 *
 * StackPage integration: emits `section-change` events on nav click.
 */
const NewspaperHeader: React.FC<NewspaperHeaderProps> = ({
  name,
  tagline,
  date: dateProp,
  edition,
  weather,
  sections,
  logoImage,
  variant = 'standard',
  activeSection,
  __stackpage,
  onSectionClick,
}) => {
  // Default to today if no date provided
  const today = React.useMemo(() => {
    if (dateProp) return dateProp;
    const d = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }, [dateProp]);

  const handleSectionClick = (slug: string) => {
    __stackpage?.emit('section-change', { section: slug });
    onSectionClick?.(slug);
  };

  return (
    <header className="bg-white">
      {/* ── Top Bar: Weather · Edition · Date ── */}
      {(variant === 'standard' || weather || edition) && (
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-1.5">
          <div className="mx-auto flex max-w-7xl items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              {weather && (
                <span className="flex items-center gap-1">
                  {weather.icon && <span className="text-sm">{weather.icon}</span>}
                  <span>{weather.city} {weather.temp}</span>
                  {weather.condition && (
                    <span className="hidden sm:inline">· {weather.condition}</span>
                  )}
                </span>
              )}
              {edition && (
                <span className="hidden sm:inline">· {edition}</span>
              )}
            </div>
            <span>{today}</span>
          </div>
        </div>
      )}

      {/* ── Nameplate ── */}
      <div className="border-b border-gray-300 px-4 py-4 md:py-6">
        <div className="mx-auto max-w-7xl text-center">
          {logoImage ? (
            <img
              src={logoImage}
              alt={name}
              className="mx-auto h-auto max-h-16 object-contain md:max-h-20"
            />
          ) : (
            <h1 className="font-serif text-3xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
              {name}
            </h1>
          )}
          {tagline && variant === 'standard' && (
            <p className="mt-1 text-xs italic text-gray-500 md:text-sm">
              {tagline}
            </p>
          )}
        </div>
      </div>

      {/* ── Section Navigation ── */}
      {sections && sections.length > 0 && (
        <nav className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-1 overflow-x-auto px-4 py-2 md:gap-2">
            {sections.map((sec) => (
              <button
                key={sec.slug}
                onClick={() => handleSectionClick(sec.slug)}
                className={`whitespace-nowrap px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors md:text-sm ${
                  activeSection === sec.slug
                    ? 'text-blue-700 underline decoration-blue-700 decoration-2 underline-offset-4'
                    : 'text-gray-600 hover:text-blue-700'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* ── Separator rule (newspaper tradition) ── */}
      {variant === 'standard' && (
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-2 py-1">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="text-[10px] uppercase tracking-widest text-gray-400">Latest Edition</span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>
        </div>
      )}
    </header>
  );
};

export default NewspaperHeader;
