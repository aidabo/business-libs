import React from "react";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";

interface FAQItem {
  question: string;
  answer: string;
}

export interface RenovationFAQProps {
  title?: string;
  description?: string;
  items?: FAQItem[];
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  _componentDesc?: string;
  __schema?: Record<string, unknown>;
  __stackpage?: StackPageRuntimeApi;
}

const DEFAULT_ITEMS: FAQItem[] = [
  {
    question: "工事期間はどのくらいかかりますか？",
    answer:
      "工事の規模によって異なりますが、水回り単品交換は1〜3日、内装リフォームは1〜2週間、フルリノベーションは1〜2ヶ月が目安です。詳細はお見積り時にご説明いたします。",
  },
  {
    question: "入居したままリフォームできますか？",
    answer:
      "工事の内容によっては、居住しながら施工が可能な場合があります。仮住まいが必要な場合は事前にご相談ください。騒音・ほこり対策を徹底して施工いたします。",
  },
  {
    question: "無料で見積もりをしてもらえますか？",
    answer: "はい、現地調査・お見積りは無料で承っております。お気軽にお問い合わせください。",
  },
  {
    question: "工事後の保証はありますか？",
    answer:
      "施工完了後、一定期間の施工保証をご提供しています。万が一不具合が発生した場合は、速やかに対応いたします。",
  },
  {
    question: "古い建物でもリフォームできますか？",
    answer:
      "築年数に関わらず対応可能です。建物の状態によっては補強工事が必要になる場合もありますが、まずはお気軽にご相談ください。",
  },
];

const RenovationFAQ: React.FC<RenovationFAQProps> = ({
  title = "よくあるご質問",
  description = "リフォーム・リノベーションに関して、お客様からよくいただくご質問をまとめました。",
  items,
  backgroundColor,
  fontSize,
  className = "",
  style,
}) => {
  const t = useT();
  const mergedStyle: React.CSSProperties = { backgroundColor, fontSize, ...style };
  const displayItems = items ?? DEFAULT_ITEMS;

  return (
    <section className={`w-full ${className}`} style={mergedStyle}>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
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

        <div className="space-y-3">
          {displayItems.map((item, i) => (
            <details
              key={i}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  Q
                </span>
                <span className="flex-1 text-sm font-bold leading-snug text-slate-900">{item.question}</span>
                <svg
                  className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="flex items-start gap-3 border-t border-slate-100 px-5 py-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                  A
                </span>
                <p className="flex-1 text-sm leading-7 text-slate-600">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

RenovationFAQ.displayName = "RenovationFAQ";
export default RenovationFAQ;
