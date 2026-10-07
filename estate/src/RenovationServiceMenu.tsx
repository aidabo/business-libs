import React from "react";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";

function safeHref(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const lower = url.toLowerCase().trimStart();
  if (lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("/")) return url;
  return undefined;
}

interface ServiceItem {
  id: string;
  title: string;
  description?: string;
  image?: string;
  icon?: string;
  url?: string;
}

export interface RenovationServiceMenuProps {
  title?: string;
  description?: string;
  services?: ServiceItem[];
  columns?: 2 | 3 | 4;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  _componentDesc?: string;
  __schema?: Record<string, unknown>;
  __stackpage?: StackPageRuntimeApi;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: "kitchen",
    title: "キッチン",
    description: "システムキッチンの交換・増設。収納力と使い勝手を向上させます。",
    icon: "🍳",
    image: "https://placehold.co/400x300/fef3c7/92400e?text=キッチン",
  },
  {
    id: "bath",
    title: "お風呂・浴室",
    description: "ユニットバスの交換・追い焚き機能・浴室乾燥機の取付。",
    icon: "🛁",
    image: "https://placehold.co/400x300/eff6ff/1d4ed8?text=浴室",
  },
  {
    id: "toilet",
    title: "トイレ",
    description: "温水洗浄便座・壁紙・床の一新。清潔で快適な空間に。",
    icon: "🚿",
    image: "https://placehold.co/400x300/f0fdf4/166534?text=トイレ",
  },
  {
    id: "interior",
    title: "内装・クロス",
    description: "壁紙・フローリング・天井の張替えで室内をリフレッシュ。",
    icon: "🏠",
    image: "https://placehold.co/400x300/fdf4ff/7e22ce?text=内装",
  },
  {
    id: "exterior",
    title: "外壁・屋根",
    description: "外壁塗装・屋根葺替え・防水工事で建物を長持ちさせます。",
    icon: "🏗️",
    image: "https://placehold.co/400x300/fff7ed/9a3412?text=外壁",
  },
  {
    id: "full-reno",
    title: "フルリノベーション",
    description: "間取り変更から設備全般まで、住まいを丸ごとリノベーション。",
    icon: "✨",
    image: "https://placehold.co/400x300/ecfdf5/065f46?text=フルリノベ",
  },
];

const RenovationServiceMenu: React.FC<RenovationServiceMenuProps> = ({
  title = "リフォームメニュー",
  description = "お住まいのお悩みに合わせて、幅広いリフォーム・リノベーションに対応しています。",
  services,
  columns = 3,
  backgroundColor,
  fontSize,
  className = "",
  style,
}) => {
  const t = useT();
  const mergedStyle: React.CSSProperties = { backgroundColor, fontSize, ...style };
  const displayServices = services ?? DEFAULT_SERVICES;
  const colClass =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section className={`w-full ${className}`} style={mergedStyle}>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
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

        <div className={`grid grid-cols-2 gap-6 ${colClass}`}>
          {displayServices.map((service) => (
            <div
              key={service.id}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
            >
              {service.image && (
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col px-5 py-4">
                <div className="mb-2 flex items-center gap-2">
                  {service.icon && <span className="text-2xl">{service.icon}</span>}
                  <h3 className="text-base font-bold text-slate-900">{service.title}</h3>
                </div>
                {service.description && (
                  <p className="flex-1 text-sm leading-6 text-slate-500">{service.description}</p>
                )}
                {service.url && (
                  <a
                    href={safeHref(service.url)}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                  >
                    {t("詳しく見る")}
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

RenovationServiceMenu.displayName = "RenovationServiceMenu";
export default RenovationServiceMenu;
