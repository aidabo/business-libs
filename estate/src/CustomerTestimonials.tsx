import React from "react";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";

function safeHref(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const lower = url.toLowerCase().trimStart();
  if (lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("/")) return url;
  return undefined;
}

interface Testimonial {
  id: string;
  name?: string;
  location?: string;
  propertyType?: string;
  rating?: number;
  comment: string;
  date?: string;
  avatar?: string;
}

export interface CustomerTestimonialsProps {
  title?: string;
  description?: string;
  testimonials?: Testimonial[];
  columns?: 1 | 2 | 3;
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

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "t-1",
    name: "T.K様",
    location: "神奈川県横浜市",
    propertyType: "2LDK マンション リノベーション",
    rating: 5,
    comment:
      "老朽化が気になっていたキッチンとお風呂を一新してもらいました。担当の方がとても丁寧で、工事中も安心して任せられました。仕上がりも想像以上で大満足です。",
    date: "2024-09",
  },
  {
    id: "t-2",
    name: "S.M様",
    location: "東京都世田谷区",
    propertyType: "3LDK 戸建て 内装リフォーム",
    rating: 5,
    comment:
      "築30年の戸建てをリフォームしました。予算内に収めてもらえただけでなく、提案力も高く、思い描いていた以上の空間になりました。",
    date: "2024-06",
  },
  {
    id: "t-3",
    name: "A.N様",
    location: "東京都品川区",
    propertyType: "1LDK マンション 水回りリフォーム",
    rating: 5,
    comment:
      "トイレ・洗面台・浴室の3点を同時にリフォーム。短期間でまとめて施工してもらえてとても助かりました。アフターフォローも丁寧です。",
    date: "2024-03",
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

const RatingStars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5 text-amber-400" aria-label={`${rating} / 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <span key={n} className={n <= rating ? "text-amber-400" : "text-slate-200"}>
        ★
      </span>
    ))}
  </div>
);

const CustomerTestimonials: React.FC<CustomerTestimonialsProps> = ({
  title = "お客様の声",
  description = "実際にリフォーム・リノベーションをご利用いただいたお客様からの感想をご紹介します。",
  testimonials,
  columns = 3,
  showAllLink,
  showAllLabel,
  emptyText = "お客様の声を準備中です。",
  backgroundColor,
  fontSize,
  className = "",
  style,
}) => {
  const t = useT();
  const mergedStyle: React.CSSProperties = { backgroundColor, fontSize, ...style };
  const displayItems = testimonials ?? DEFAULT_TESTIMONIALS;
  const colClass =
    columns === 1 ? "sm:grid-cols-1" : columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";

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

        {displayItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-400">
            {t(emptyText)}
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-6 ${colClass}`}>
            {displayItems.map((item) => (
              <div
                key={item.id}
                className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  {typeof item.rating === "number" && <RatingStars rating={item.rating} />}
                  {item.date && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                      {formatDate(item.date)}
                    </span>
                  )}
                </div>

                <div className="relative flex-1">
                  <span className="absolute -left-1 -top-2 text-3xl leading-none text-slate-200" aria-hidden="true">
                    “
                  </span>
                  <p className="relative pl-5 text-sm leading-7 text-slate-600">{item.comment}</p>
                </div>

                <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
                  {item.avatar ? (
                    <img
                      src={item.avatar}
                      alt={item.name || ""}
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                      {(item.name || "?").slice(0, 1)}
                    </span>
                  )}
                  <div className="min-w-0">
                    {item.name && <p className="text-sm font-bold text-slate-900">{item.name}</p>}
                    <p className="truncate text-xs text-slate-400">
                      {[item.location, item.propertyType].filter(Boolean).join(" ・ ")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showAllLink && (
          <div className="mt-10 text-center">
            <a
              href={safeHref(showAllLink)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              {t(showAllLabel || "お客様の声をすべて見る")}
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

CustomerTestimonials.displayName = "CustomerTestimonials";
export default CustomerTestimonials;
