import React from "react";
import { useT } from "./hooks/useTranslation";


export interface PromoBannerProps {
  title?: string;
  text?: string;
  buttonLabel?: string;
  link?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  onButtonClick?: () => void;
}

const PromoBanner: React.FC<PromoBannerProps> = ({
  title,
  text,
  buttonLabel,
  link = "#",
  backgroundImage,
  backgroundColor = "#1e3a8a", // blue-900
  fontSize,
  className = "",
  style,
  onButtonClick,
}) => {
  const t = useT();

  const displayTitle = title || t("Special Offer");
  const displayText = text || t("Contact us today for a free consultation and get 50% off your listing fee!");
  const displayButtonLabel = buttonLabel || t("Learn More");


  const containerStyle: React.CSSProperties = {
    backgroundColor: backgroundColor,
    fontSize: fontSize,
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    ...style,
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl shadow-lg my-8 ${className}`}
      style={containerStyle}
    >
      {/* Overlay if image is used */}
      {backgroundImage && <div className="absolute inset-0 bg-black/50" />}

      <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div className="text-white max-w-2xl">
          <h3 className="text-2xl md:text-3xl font-bold mb-3">{displayTitle}</h3>
          <p className="text-blue-50 md:text-lg opacity-90">{displayText}</p>
        </div>

        <div className="shrink-0">
          {link && link !== "#" && !onButtonClick ? (
            <a
              href={link}
              className="inline-block bg-white text-blue-900 hover:bg-gray-100 font-bold py-3 px-8 rounded-full shadow-md transition-all transform hover:scale-105"
            >
              {displayButtonLabel}
            </a>
          ) : (
            <button
              onClick={onButtonClick}
              className="bg-white text-blue-900 hover:bg-gray-100 font-bold py-3 px-8 rounded-full shadow-md transition-all transform hover:scale-105"
            >
              {displayButtonLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
