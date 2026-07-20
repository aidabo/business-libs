import React from "react";
import { ShieldCheckIcon, UserGroupIcon, HomeModernIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { useT } from "./hooks/useTranslation";

export interface CompanyFeaturesProps {
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
}



const CompanyFeatures: React.FC<CompanyFeaturesProps> = ({
  title = "当社の強み",
  subtitle = "お客様満足度を最優先に、不動産に関するワンストップサービスを提供しています。",
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

  const features = [
    {
      name: t("Extensive experience"),
      description: t("Over 5,000 transactions in the area, trusted by many clients."),
      icon: UserGroupIcon,
    },
    {
      name: t("Curated properties"),
      description: t("We can introduce exclusive and premium properties, including listings not generally available to the public."),
      icon: HomeModernIcon,
    },
    {
      name: t("Trusted transactions"),
      description: t("Partner judicial scriveners and tax accountants ensure transparent and secure transactions."),
      icon: ShieldCheckIcon,
    },
    {
      name: t("Optimal pricing proposal"),
      description: t("Fair pricing proposals based on market analysis to maximize your asset value."),
      icon: CurrencyDollarIcon,
    },
  ];
  return (
    <div className={`py-10 bg-white overflow-hidden ${className}`} style={mergedStyle}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="relative z-10 text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-sm font-semibold leading-6 text-blue-600 uppercase tracking-wide">
            {t("Our advantages")}
          </h2>
          <p className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {title}
          </p>
          <p className="mt-2 text-base leading-7 text-gray-600">{subtitle}</p>
        </div>

        {/* Container-width responsive: columns are driven by the component's own
            box, not the viewport — so a narrow placement on a wide PC screen
            still stacks the cards vertically instead of cramming 4 columns. */}
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
        >
          {features.map((feature) => (
            <div key={feature.name} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors duration-300">
              <div className="flex items-center justify-center h-10 w-10 shrink-0 rounded-full bg-blue-100 text-blue-600">
                <feature.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-gray-900 mb-1">{feature.name}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyFeatures;
