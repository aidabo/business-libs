import React from "react";
import {
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  HomeModernIcon,
} from "@heroicons/react/24/outline";
import { useT } from "./hooks/useTranslation";

export interface SaleProcessProps {
  title?: string;
  subtitle?: string;
  steps?: { title: string; description: string; icon?: React.ReactNode }[];
  /** Cards per row on large screens (2–4). Default 4. */
  columns?: 2 | 3 | 4;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
}

const SaleProcess: React.FC<SaleProcessProps> = ({
  title = "How It Works",
  subtitle = "Our simple 4-step process to sell your home.",
  steps,
  columns = 4,
  backgroundColor,
  fontSize,
  className = "",
  style,
}) => {
  const t = useT();

  const mergedStyle: React.CSSProperties = {
    backgroundColor,
    fontSize,
    ...style,
  };

  const defaultSteps = [
    {
      title: t("Consultation & Assessment"),
      description: t(
        "We visit your property and provide a free, accurate market valuation based on local data.",
      ),
      icon: <HomeModernIcon className="w-6 h-6" />,
    },
    {
      title: t("Listing & Marketing"),
      description: t(
        "We list on major platforms like REINS with professional photography to attract buyers.",
      ),
      icon: <ClipboardDocumentCheckIcon className="w-6 h-6" />,
    },
    {
      title: t("Viewings & Negotiation"),
      description: t(
        "Our agents host viewings and negotiate with buyers to secure the best price and terms.",
      ),
      icon: <ChartBarIcon className="w-6 h-6" />,
    },
    {
      title: t("Contract & Handover"),
      description: t(
        "We handle the sales contract, settlement, and guide you through the final handover.",
      ),
      icon: <CurrencyDollarIcon className="w-6 h-6" />,
    },
  ];

  const displaySteps = steps || defaultSteps;

  const gridCols: Record<number, string> = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section className={`py-10 bg-white ${className}`} style={mergedStyle}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t(title)}</h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">{t(subtitle)}</p>
        </div>

        <div className={`grid grid-cols-1 ${gridCols[columns]} gap-4`}>
          {displaySteps.map((step, index) => (
            <div
              key={index}
              className="relative rounded-xl border border-gray-100 bg-gray-50 p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 text-blue-600 shrink-0">
                  {step.icon}
                </span>
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold shrink-0">
                  {index + 1}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1 leading-snug">
                {t(step.title)}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t(step.description)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SaleProcess;
