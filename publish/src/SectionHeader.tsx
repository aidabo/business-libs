import React from 'react';

export interface SectionHeaderProps {
  /** Section title (e.g. "Politics", "Business", "Sports") */
  title: string;
  /** Subtitle or description */
  subtitle?: string;
  /** Icon or emoji */
  icon?: string;
  /** Section URL (for "View All" link) */
  url?: string;
  /** Color theme accent (Tailwind border color, default: blue-700) */
  accentColor?: string;
  /** Whether to show a decorative divider line */
  showDivider?: boolean;
}

/**
 * SectionHeader — newspaper section divider with decorative line and section title.
 *
 * Used to separate newspaper sections (Politics, Economy, Culture, Sports, etc.)
 * with a professional typographic header. Features a left accent bar, serif title,
 * optional subtitle, and bottom decorative line.
 */
const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  icon,
  url,
  accentColor = 'border-l-blue-700',
  showDivider = true,
}) => {
  return (
    <div className="px-4 sm:px-0 py-3 sm:py-4">
      {/* ── Title row ── */}
      <div className={`flex items-center gap-2 sm:gap-3 border-l-4 ${accentColor} pl-3`}>
        {icon && <span className="text-xl">{icon}</span>}
        <div className="flex-1">
          <h2 className="font-serif text-2xl font-bold text-gray-900 md:text-3xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        {url && (
          <a
            href={url}
            className="text-xs font-semibold uppercase tracking-wider text-blue-600 hover:underline"
          >
            View All
          </a>
        )}
      </div>

      {/* ── Decorative divider ── */}
      {showDivider && (
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1 w-12 rounded-full bg-blue-700" />
          <div className="h-px flex-1 bg-gray-200" />
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
