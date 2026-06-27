import React, { useState, useEffect } from 'react';

export interface Announcement {
  id: string;
  text: string;
  link?: string;
  severity: 'info' | 'warning' | 'emergency';
}

export interface AnnouncementBannerProps {
  announcements: Announcement[];
  dismissible?: boolean;
  autoRotate?: boolean;
  interval?: number;
}

const severityStyles: Record<string, string> = {
  info: 'bg-blue-600',
  warning: 'bg-yellow-500 text-gray-900',
  emergency: 'bg-red-600',
};

const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
  announcements,
  dismissible = true,
  autoRotate = true,
  interval = 5000,
}) => {
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!autoRotate || announcements.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % announcements.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoRotate, announcements.length, interval]);

  const visible = announcements.filter((a) => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  const active = visible[current % visible.length];
  if (!active) return null;

  const styleClass = severityStyles[active.severity] || severityStyles.info;

  return (
    <div className={`flex items-center justify-between px-4 py-2 text-sm text-white ${styleClass}`}>
      <div className="flex items-center gap-2">
        {active.severity === 'emergency' && (
          <span className="rounded bg-white/20 px-1.5 py-0.5 text-xs font-bold">ALERT</span>
        )}
        {active.link ? (
          <a href={active.link} className="hover:underline">
            {active.text}
          </a>
        ) : (
          <span>{active.text}</span>
        )}
      </div>
      {dismissible && (
        <button
          onClick={() => setDismissed((prev) => new Set(prev).add(active.id))}
          className="ml-4 shrink-0 text-white/80 hover:text-white"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default AnnouncementBanner;
