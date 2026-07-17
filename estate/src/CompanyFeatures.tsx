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
      name: t("豊富な実績"),
      description: t("地域で5,000件以上の取引実績。多くのお客様から信頼をいただいています。"),
      icon: UserGroupIcon,
    },
    {
      name: t("厳選物件"),
      description: t("一般には公開されない限定物件や高級物件など、多数の優良物件をご紹介できます。"),
      icon: HomeModernIcon,
    },
    {
      name: t("安心の取引"),
      description: t("提携の司法書士・税理士が取引の透明性と安全性を確保。初めての方も安心です。"),
      icon: ShieldCheckIcon,
    },
    {
      name: t("最適な価格提案"),
      description: t("市場分析に基づいた適正価格でのご提案。お客様の資産価値を最大化します。"),
      icon: CurrencyDollarIcon,
    },
  ];
  return (
    <div className={`py-10 bg-white overflow-hidden ${className}`} style={mergedStyle}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="relative z-10 text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-sm font-semibold leading-6 text-blue-600 uppercase tracking-wide">
            {t("当社の特長")}
          </h2>
          <p className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {title}
          </p>
          <p className="mt-2 text-base leading-7 text-gray-600">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
