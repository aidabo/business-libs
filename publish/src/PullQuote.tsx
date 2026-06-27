import React from 'react';

export interface PullQuoteProps {
  /** Quote text */
  text: string;
  /** Attribution source */
  attribution?: string;
  /** Attribution title/role */
  attributionTitle?: string;
  /** Visual variant */
  variant?: 'large' | 'inset' | 'sidebar';
  /** Accent color class (Tailwind) */
  accentColor?: string;
}

/**
 * PullQuote — standalone pull quote component for newspaper/article layouts.
 *
 * Large quotation mark accent with text and attribution.
 * Three variants:
 * - `large` (default): prominent center-aligned quote with large decorative marks
 * - `inset`: inline quote floated to the right within article body
 * - `sidebar`: sidebar-style quote used in magazine layouts
 */
const PullQuote: React.FC<PullQuoteProps> = ({
  text,
  attribution,
  attributionTitle,
  variant = 'large',
  accentColor = 'text-blue-700',
}) => {
  if (variant === 'sidebar') {
    return (
      <aside className="border-l-4 border-blue-700 bg-gray-50 py-3 sm:py-4 px-3 sm:pl-4 sm:pr-3">
        <span className={`block text-3xl leading-none ${accentColor}`}>&ldquo;</span>
        <blockquote className="my-2 font-serif text-base italic leading-relaxed text-gray-800">
          {text}
        </blockquote>
        {attribution && (
          <cite className="block text-xs font-semibold not-italic text-gray-500">
            {attribution}
            {attributionTitle && <span className="font-normal">, {attributionTitle}</span>}
          </cite>
        )}
      </aside>
    );
  }

  return (
    <aside className="my-8 px-4 sm:px-0 text-center">
      <span className={`block text-5xl leading-none ${accentColor} md:text-6xl`}>&ldquo;</span>
      <blockquote className="mx-auto max-w-2xl font-serif text-lg italic leading-relaxed text-gray-800 sm:text-xl md:text-2xl">
        {text}
      </blockquote>
      {attribution && (
        <cite className="mt-3 block text-sm font-semibold not-italic text-gray-500">
          &mdash; {attribution}
          {attributionTitle && <span className="font-normal">, {attributionTitle}</span>}
        </cite>
      )}
      <span className={`mt-2 block text-5xl leading-none ${accentColor} md:text-6xl`}>&rdquo;</span>
    </aside>
  );
};

export default PullQuote;
