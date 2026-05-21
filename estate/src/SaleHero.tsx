import React from "react";
import { useT } from "./hooks/useTranslation";


export interface SaleHeroProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  ctaText?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  onCtaClick?: () => void;
}

const SaleHero: React.FC<SaleHeroProps> = ({
  title = "Sell Your Home for the Best Price",
  subtitle = "Expert valuation, marketing strategies, and support to get you the best deal.",
  backgroundImage = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  ctaText = "Get Free Assessment",
  backgroundColor,
  fontSize,
  className = "",
  style,
  onCtaClick,
}) => {
  const t = useT();

  const mergedStyle: React.CSSProperties = {
    backgroundColor,
    fontSize,
    ...style,
  };

  return (
    <div
      className={`relative w-full h-full min-h-[400px] flex items-center justify-center text-center text-white ${className}`}
      style={mergedStyle}
    >
      {/* Background Image with darker overlay for readability */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          {t(title)}
        </h1>
        <p className="text-xl md:text-2xl opacity-90 font-light max-w-2xl mx-auto">
          {t(subtitle)}
        </p>

        <div className="pt-8">
          <button
            onClick={onCtaClick}
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-10 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            {t(ctaText)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaleHero;
