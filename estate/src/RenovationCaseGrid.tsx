import React from "react";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";
import type { RenovationCase } from "./RenovationCaseCard";

export interface RenovationCaseGridProps {
  title?: string;
  description?: string;
  cases?: RenovationCase[];
  columns?: 2 | 3;
  maxItems?: number;
  showAllLink?: string;
  showAllLabel?: string;
  emptyText?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  _componentDesc?: string;
  __schema?: Record<string, unknown>;
  __stackpage?: StackPageRuntimeApi;
}

const DEFAULT_CASES: RenovationCase[] = [
  {
    id: "case-1",
    title: "横浜市 2LDK マンション フルリノベーション",
    location: "神奈川県横浜市",
    date: "2024-09",
    mainImage: "https://placehold.co/800x500/bfdbfe/1d4ed8?text=施工後",
    description: "2LDK中古マンションの室内全体をリノベーション。老朽化した設備・内装を一新し、快適な居住空間に仕上げました。",
    workItems: ["内装クロス張替え（全室）", "フローリング張替え", "キッチン交換", "ユニットバス交換", "トイレ交換"],
  },
  {
    id: "case-2",
    title: "世田谷区 3LDK 戸建て リフォーム",
    location: "東京都世田谷区",
    date: "2024-06",
    mainImage: "https://placehold.co/800x500/d1fae5/065f46?text=施工後",
    description: "築30年の戸建て住宅を現代的なデザインにリフォーム。水回り全面刷新と断熱改修を実施しました。",
    workItems: ["水回り全面交換", "断熱リフォーム", "外壁塗装", "フローリング張替え"],
  },
  {
    id: "case-3",
    title: "品川区 1LDK マンション リノベーション",
    location: "東京都品川区",
    date: "2024-03",
    mainImage: "https://placehold.co/800x500/fef3c7/92400e?text=施工後",
    description: "コンパクトな1LDKを開放的なワンルーム風レイアウトにリノベーション。間取り変更と設備刷新を同時施工。",
    workItems: ["間取り変更", "キッチン交換", "クロス張替え", "照明更新"],
  },
];

function formatDate(d: string): string {
  try {
    const [y, m] = d.split("-");
    return m ? `${y}年${m}月` : y;
  } catch {
    return d;
  }
}

const RenovationCaseGrid: React.FC<RenovationCaseGridProps> = ({
  title = "施工事例",
  description = "実際の施工事例をご紹介します。リフォーム・リノベーションのご参考にどうぞ。",
  cases,
  columns = 3,
  maxItems = 9,
  showAllLink,
  showAllLabel,
  emptyText = "施工事例を準備中です。",
  backgroundColor,
  fontSize,
  className = "",
  style,
}) => {
  const t = useT();
  const mergedStyle: React.CSSProperties = { backgroundColor, fontSize, ...style };
  const displayCases = (cases ?? DEFAULT_CASES).slice(0, maxItems);
  const colClass = columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section className={`w-full ${className}`} style={mergedStyle}>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        {(title || description) && (
          <div className="mb-10 text-center">
            {title && (
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {t(title)}
              </h2>
            )}
            {description && (
              <p className="mt-3 text-sm text-slate-500">{t(description)}</p>
            )}
          </div>
        )}

        {/* Grid */}
        {displayCases.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-400">
            {t(emptyText)}
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-6 ${colClass}`}>
            {displayCases.map((c) => (
              <CaseCard key={c.id} item={c} t={t} />
            ))}
          </div>
        )}

        {/* View all link */}
        {showAllLink && (
          <div className="mt-10 text-center">
            <a
              href={showAllLink}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              {t(showAllLabel || "施工事例をすべて見る")}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

function CaseCard({ item, t }: { item: RenovationCase; t: (key: string) => string }) {
  const inner = (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        {item.mainImage ? (
          <img
            src={item.mainImage}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-200 text-slate-400 text-xs">
            {t("No image")}
          </div>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white">
          {t("Renovation")}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-5 py-4">
        {/* Meta */}
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          {item.location && (
            <span className="flex items-center gap-0.5">
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {item.location}
            </span>
          )}
          {item.date && <span>{formatDate(item.date)} {t("Completed")}</span>}
        </div>

        <h3 className="mb-2 text-base font-bold leading-snug text-slate-900 line-clamp-2 flex-1">
          {item.title}
        </h3>

        {item.description && (
          <p className="mb-3 text-sm leading-6 text-slate-500 line-clamp-2">{item.description}</p>
        )}

        {/* Work items */}
        {item.workItems && item.workItems.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.workItems.slice(0, 3).map((w, i) => (
              <span key={i} className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {w}
              </span>
            ))}
            {item.workItems.length > 3 && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                +{item.workItems.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return item.url ? (
    <a href={item.url} target="_blank" rel="noreferrer" className="block h-full">
      {inner}
    </a>
  ) : (
    <div className="h-full">{inner}</div>
  );
}

RenovationCaseGrid.displayName = "RenovationCaseGrid";
export default RenovationCaseGrid;
