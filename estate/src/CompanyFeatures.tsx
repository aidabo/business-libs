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
  title = "Why Choose Us",
  subtitle = "We provide full-service real estate solutions with a focus on client satisfaction.",
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
      name: t("Trusted by Thousands"),
      description: t("We are the most trusted agency in the region with over 5,000 happy clients."),
      icon: UserGroupIcon,
    },
    {
      name: t("Premium Properties"),
      description: t("Access to exclusive listings and high-end luxury homes not available elsewhere."),
      icon: HomeModernIcon,
    },
    {
      name: t("Secure Transactions"),
      description: t("Our legal team ensures every transaction is transparent, secure, and hassle-free."),
      icon: ShieldCheckIcon,
    },
    {
      name: t("Best Value Guarantee"),
      description: t("We negotiate the best deals to ensure you get the most value for your investment."),
      icon: CurrencyDollarIcon,
    },
  ];
  return (
    <div className={`py-16 bg-white overflow-hidden ${className}`} style={mergedStyle}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="relative z-10 text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-base font-semibold leading-7 text-blue-600 uppercase tracking-wide">
            {t("Our Benefits")}
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {title}
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div key={feature.name} className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors duration-300">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-6">
                <feature.icon className="h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.name}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyFeatures;
