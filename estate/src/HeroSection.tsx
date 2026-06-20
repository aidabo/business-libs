import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useT } from "./hooks/useTranslation";

export interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  showSearch?: boolean;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title = "理想の住まいを見つけよう",
  subtitle = "あなたにぴったりの物件を、最新のラインナップから検索できます。",
  backgroundImage = "https://images.unsplash.com/photo-1600596542815-6ad4c1277855?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  showSearch = true,
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

  return (

    <div
      className={`relative w-full h-full min-h-[300px] flex items-center justify-center text-center text-white ${className}`}
      style={mergedStyle}
    >
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          {t(title)}
        </h1>
        <p className="text-xl md:text-2xl opacity-90 font-light max-w-2xl mx-auto">
          {t(subtitle)}
        </p>

        {showSearch && (
          <div className="mt-8 bg-white p-2 rounded-full shadow-lg max-w-2xl mx-auto flex items-center">
            <div className="pl-4 text-gray-400">
              <MagnifyingGlassIcon className="h-6 w-6" />
            </div>
            <input
              type="text"
              placeholder={t("Search by location, price, or keyword...")}
              className="flex-grow px-4 py-3 text-gray-800 placeholder-gray-500 bg-transparent focus:outline-none text-lg"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-colors duration-200">
              {t("Search")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroSection;
