import React, { useState } from 'react';
import type { StackPageRuntimeApi } from './types';

export interface HeroBannerProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  badgeText?: string;
  badgeColor?: string;
  ctaText?: string;
  ctaLink?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  keywordKey?: string;
  __stackpage?: StackPageRuntimeApi;
  onSearch?: (keyword: string) => void;
  onCtaClick?: () => void;
}

const HeroBanner: React.FC<HeroBannerProps> = ({
  title,
  subtitle,
  backgroundImage,
  badgeText,
  badgeColor = 'bg-red-600',
  ctaText,
  showSearch = false,
  searchPlaceholder = 'Search...',
  keywordKey,
  __stackpage,
  onSearch,
  onCtaClick,
}) => {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    __stackpage?.emit('search', { keyword, key: keywordKey });
    onSearch?.(keyword);
  };

  return (
    <section
      className="relative flex min-h-[400px] items-center justify-center bg-gray-900 bg-cover bg-center"
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
        {badgeText && (
          <span className={`mb-4 inline-block rounded px-3 py-1 text-sm font-semibold text-white ${badgeColor}`}>
            {badgeText}
          </span>
        )}
        <h1 className="mb-4 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-200">{subtitle}</p>
        )}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {ctaText && (
            <button
              onClick={onCtaClick}
              className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              {ctaText}
            </button>
          )}
          {showSearch && (
            <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={searchPlaceholder}
                className="flex-1 rounded-lg border-0 px-4 py-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Search
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
