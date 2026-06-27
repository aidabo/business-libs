import React, { useEffect, useState } from 'react';

export interface BreakingNewsProps {
  items: { id: string; title: string; url?: string }[];
  interval?: number;
  label?: string;
}

const BreakingNews: React.FC<BreakingNewsProps> = ({
  items,
  interval = 5000,
  label = 'BREAKING',
}) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, interval);
    return () => clearInterval(timer);
  }, [items.length, interval]);

  if (items.length === 0) return null;

  return (
    <div className="flex items-center gap-3 bg-red-600 px-3 sm:px-4 py-2 sm:py-2 text-white min-h-[44px]">
      <span className="shrink-0 rounded bg-white/20 px-2 py-0.5 text-xs font-bold tracking-wider">
        {label}
      </span>
      <div className="overflow-hidden">
        <a
          href={items[current]?.url || '#'}
          className="block animate-fadeIn text-sm font-medium hover:underline"
          key={current}
        >
          {items[current]?.title}
        </a>
      </div>
    </div>
  );
};

export default BreakingNews;
