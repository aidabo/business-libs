import React from "react";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";

export interface NewsItem {
  id: string;
  date: string;
  title: string;
  excerpt?: string;
  category?: string;
  url?: string;
}

export interface NewsFeedProps {
  title?: string;
  description?: string;
  items?: NewsItem[];
  maxItems?: number;
  showAllLink?: string;
  showAllLabel?: string;
  emptyText?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  __stackpage?: StackPageRuntimeApi;
}

const DEFAULT_NEWS: NewsItem[] = [
  {
    id: "news-1",
    date: "2024-09-26",
    title: "サイトをリニューアルしました",
    excerpt: "より使いやすく、情報が探しやすいサイトに生まれ変わりました。",
    category: "お知らせ",
  },
  {
    id: "news-2",
    date: "2024-08-15",
    title: "夏季休業のお知らせ",
    excerpt: "誠に勝手ながら、8月13日から8月16日まで夏季休業とさせていただきます。",
    category: "お知らせ",
  },
  {
    id: "news-3",
    date: "2024-07-01",
    title: "新着物件のお知らせ",
    excerpt: "世田谷区・三鷹市・大田区に新着物件が追加されました。",
    category: "物件情報",
  },
];

const NewsFeed: React.FC<NewsFeedProps> = ({
  title = "お知らせ",
  description = "最新の情報をお届けします。",
  items,
  maxItems = 5,
  showAllLink,
  showAllLabel,
  emptyText = "現在、お知らせはありません。",
  backgroundColor,
  fontSize,
  className = "",
  style,
  __stackpage,
}) => {
  const t = useT();

  const mergedStyle: React.CSSProperties = {
    backgroundColor,
    fontSize,
    ...style,
  };

  const displayItems = (items ?? DEFAULT_NEWS).slice(0, maxItems);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
    } catch {
      return dateStr;
    }
  };

  const handleItemClick = (item: NewsItem) => {
    if (__stackpage) {
      __stackpage.emit("estate:news:selected", {
        id: item.id,
        title: item.title,
        date: item.date,
      });
    }
    if (item.url && typeof window !== "undefined") {
      window.location.href = item.url;
    }
  };

  return (
    <section className={`py-16 ${className}`} style={mergedStyle}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t(title)}
          </h2>
          {description && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t(description)}
            </p>
          )}
        </div>

        {displayItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">{t(emptyText)}</div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {displayItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`group flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white transition-all hover:shadow-md hover:border-gray-300 ${item.url ? "cursor-pointer" : ""}`}
              >
                <div className="flex items-center gap-3 sm:w-48 shrink-0">
                  <span className="text-sm text-gray-400 whitespace-nowrap">
                    {formatDate(item.date)}
                  </span>
                  {item.category && (
                    <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
                      {t(item.category)}
                    </span>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {t(item.title)}
                  </h3>
                  {item.excerpt && (
                    <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                      {t(item.excerpt)}
                    </p>
                  )}
                </div>
                {item.url && (
                  <span className="text-blue-500 text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {t("Read more")} →
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {showAllLink && (
          <div className="text-center mt-8">
            <a
              href={showAllLink}
              className="inline-block rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t(showAllLabel || "すべてを見る")}
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsFeed;
