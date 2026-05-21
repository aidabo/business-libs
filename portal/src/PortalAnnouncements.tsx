import React from "react";
import { useT } from "./hooks/useTranslation";

export interface AnnouncementItem {
  title: string;
  date?: string;
  summary?: string;
  link?: string;
}

export interface PortalAnnouncementsProps {
  title?: string;
  maxItems?: number;
  showSummary?: boolean;
  moreLabel?: string;
  moreUrl?: string;
  items?: AnnouncementItem[];
  className?: string;
  style?: React.CSSProperties;
}

const PortalAnnouncements: React.FC<PortalAnnouncementsProps> = ({
  title,
  maxItems = 10,
  showSummary = true,
  moreLabel,
  moreUrl,
  items = [],
  className = "",
  style,
}) => {
  const t = useT();
  const shownItems = items.slice(0, Math.max(1, maxItems));

  return (
    <section className={`rounded-xl border border-gray-200 bg-white p-5 ${className}`} style={style}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">{title || t("Latest Announcements")}</h2>
        {moreUrl && (
          <a className="text-sm font-medium text-blue-600 hover:text-blue-700" href={moreUrl}>
            {moreLabel || t("See more")}
          </a>
        )}
      </div>

      <ul className="space-y-3">
        {shownItems.map((item, index) => {
          const content = (
            <>
              <div className="text-sm text-gray-500">{item.date || ""}</div>
              <div className="text-sm font-medium text-gray-900">{item.title}</div>
              {showSummary && item.summary && <div className="text-sm text-gray-600">{item.summary}</div>}
            </>
          );

          return (
            <li key={`${item.title}-${index}`} className="rounded-md border border-gray-100 p-3 hover:bg-gray-50">
              {item.link ? (
                <a href={item.link} className="block" target="_blank" rel="noreferrer">
                  {content}
                </a>
              ) : (
                content
              )}
            </li>
          );
        })}

        {shownItems.length === 0 && <li className="text-sm text-gray-500">{t("No announcements yet.")}</li>}
      </ul>
    </section>
  );
};

export default PortalAnnouncements;
