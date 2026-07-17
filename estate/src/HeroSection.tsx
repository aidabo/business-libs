import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useT } from "./hooks/useTranslation";
import { StackPageRuntimeApi, ESTATE_STATE_KEYS, setPageState } from "./types";

export interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  /** Optional background video (mp4/webm). When set it plays muted/looping and
   *  covers the background; `backgroundImage` is used as its poster/fallback. */
  backgroundVideo?: string;
  /** Dark overlay strength over the background, 0 (none) → 1 (black). Accepts a
   *  0–100 percentage too. Keeps the title readable over bright media. */
  overlayOpacity?: number;
  showSearch?: boolean;
  keywordKey?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  __stackpage?: StackPageRuntimeApi;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title = "理想の住まいを見つけよう",
  subtitle = "あなたにぴったりの物件を、最新のラインナップから検索できます。",
  backgroundImage = "https://images.unsplash.com/photo-1600596542815-6ad4c1277855?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  backgroundVideo,
  overlayOpacity = 0.4,
  showSearch = true,
  keywordKey = ESTATE_STATE_KEYS.keyword,
  backgroundColor,
  fontSize,
  className = "",
  style,
  __stackpage,
}) => {
  const t = useT();
  const [searchValue, setSearchValue] = React.useState("");

  // Normalize overlay opacity: allow 0–1 or a 0–100 percentage, then clamp.
  const overlayAlpha = (() => {
    const raw = Number(overlayOpacity);
    if (!Number.isFinite(raw)) return 0.4;
    const v = raw > 1 ? raw / 100 : raw;
    return Math.min(1, Math.max(0, v));
  })();

  const handleSearch = () => {
    if (__stackpage) {
      setPageState(__stackpage, keywordKey, searchValue);
      __stackpage.emit("estate:keyword:changed", { keyword: searchValue });
    }
  };

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
      {/* Background media (video preferred, else image) with a dark overlay */}
      <div className="absolute inset-0 overflow-hidden">
        {backgroundVideo ? (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src={backgroundVideo}
            poster={backgroundImage}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0, 0, 0, ${overlayAlpha})` }}
        />
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
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={t("エリア・駅名・キーワードで検索")}
              className="flex-grow px-4 py-3 text-gray-800 placeholder-gray-500 bg-transparent focus:outline-none text-lg"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-colors duration-200"
            >
              {t("検索")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroSection;
