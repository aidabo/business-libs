import React from "react";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";

interface WarrantyBadge {
  title: string;
  description?: string;
  icon?: string;
  years?: number;
  highlight?: boolean;
}

export interface RenovationWarrantyBadgesProps {
  title?: string;
  description?: string;
  badges?: WarrantyBadge[];
  accentColor?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  _componentDesc?: string;
  __schema?: Record<string, unknown>;
  __stackpage?: StackPageRuntimeApi;
}

const DEFAULT_BADGES: WarrantyBadge[] = [
  {
    title: "施工保証",
    description: "工事完了後も安心の施工保証。不具合は迅速に対応いたします。",
    icon: "🛡️",
    years: 2,
    highlight: true,
  },
  {
    title: "無料アフター点検",
    description: "施工完了から6ヶ月後に無料で点検を実施します。",
    icon: "🔍",
    highlight: false,
  },
  {
    title: "有資格者施工",
    description: "国家資格を持つ職人・専門スタッフが責任を持って施工します。",
    icon: "📜",
    highlight: false,
  },
  {
    title: "地元密着サービス",
    description: "地域に根ざした丁寧な対応でアフターフォローも安心です。",
    icon: "🏡",
    highlight: false,
  },
];

const RenovationWarrantyBadges: React.FC<RenovationWarrantyBadgesProps> = ({
  title = "安心の保証・サポート",
  description = "施工後も末長くお付き合いいただけるよう、充実した保証とサポート体制をご用意しています。",
  badges,
  accentColor = "#2563eb",
  backgroundColor,
  fontSize,
  className = "",
  style,
}) => {
  const t = useT();
  const mergedStyle: React.CSSProperties = { backgroundColor, fontSize, ...style };
  const displayBadges = badges ?? DEFAULT_BADGES;

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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayBadges.map((badge, i) => (
            <div
              key={i}
              className={`relative flex h-full flex-col items-center rounded-2xl border bg-white px-5 py-6 text-center shadow-sm transition-shadow hover:shadow-md ${
                badge.highlight ? "border-2" : "border-slate-200"
              }`}
              style={badge.highlight ? { borderColor: accentColor } : undefined}
            >
              {typeof badge.years === "number" && (
                <span
                  className="absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  {badge.years}
                  {t("年保証")}
                </span>
              )}
              {badge.icon && <span className="text-4xl">{badge.icon}</span>}
              <h3 className="mt-3 text-base font-bold text-slate-900">{badge.title}</h3>
              {badge.description && (
                <p className="mt-2 text-sm leading-6 text-slate-500">{badge.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

RenovationWarrantyBadges.displayName = "RenovationWarrantyBadges";
export default RenovationWarrantyBadges;
