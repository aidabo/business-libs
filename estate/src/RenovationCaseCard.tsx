import React from "react";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";

function safeHref(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const lower = url.toLowerCase().trimStart();
  if (lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("/")) return url;
  return undefined;
}

export interface RenovationCase {
  id: string;
  title: string;
  location?: string;
  date?: string;
  mainImage?: string;
  description?: string;
  workItems?: string[];
  url?: string;
}

export interface RenovationCaseCardProps {
  title?: string;
  location?: string;
  date?: string;
  mainImage?: string;
  description?: string;
  workItems?: string[];
  url?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  _componentDesc?: string;
  __schema?: Record<string, unknown>;
  __stackpage?: StackPageRuntimeApi;
}

const SAMPLE_WORK_ITEMS = [
  "内装クロス張替え（全室）",
  "フローリング張替え",
  "キッチン交換",
  "ユニットバス交換",
  "トイレ交換",
];

const RenovationCaseCard: React.FC<RenovationCaseCardProps> = ({
  title = "横浜市 2LDK マンション フルリノベーション",
  location = "神奈川県横浜市",
  date = "2024-09",
  mainImage = "https://placehold.co/800x500/bfdbfe/1d4ed8?text=施工後",
  description = "2LDK中古マンションの室内全体をリノベーション。老朽化した設備・内装を一新し、快適な居住空間に仕上げました。",
  workItems = SAMPLE_WORK_ITEMS,
  url,
  backgroundColor,
  fontSize,
  className = "",
  style,
}) => {
  const t = useT();
  const mergedStyle: React.CSSProperties = { backgroundColor, fontSize, ...style };

  const formatDate = (d: string) => {
    try {
      const [y, m] = d.split("-");
      return m ? `${y}年${m}月` : y;
    } catch {
      return d;
    }
  };

  const inner = (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        {mainImage && (
          <img
            src={mainImage}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <div className="absolute right-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
          {t("Renovation")}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {/* Meta */}
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          {location && (
            <span className="flex items-center gap-0.5">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {location}
            </span>
          )}
          {date && <span>{formatDate(date)} {t("Completed")}</span>}
        </div>

        {/* Title */}
        <h3 className="mb-2 text-base font-bold leading-snug text-slate-900 line-clamp-2">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="mb-3 text-sm leading-6 text-slate-500 line-clamp-2">{description}</p>
        )}

        {/* Work items */}
        {workItems && workItems.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {workItems.slice(0, 4).map((item, i) => (
              <span
                key={i}
                className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
              >
                {item}
              </span>
            ))}
            {workItems.length > 4 && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                +{workItems.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`w-full ${className}`} style={mergedStyle}>
      {url ? (
        <a href={safeHref(url)} target="_blank" rel="noreferrer" className="block">
          {inner}
        </a>
      ) : (
        inner
      )}
    </div>
  );
};

RenovationCaseCard.displayName = "RenovationCaseCard";
export default RenovationCaseCard;
