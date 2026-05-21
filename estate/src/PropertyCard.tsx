import React from "react";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";
import {
  ESTATE_STATE_KEYS,
  ESTATE_EVENTS,
  buildPropertySelectionEvent,
  setPageState,
} from "./types";

const BedIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 mr-1"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
    />
  </svg>
);

const BathIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 mr-1"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5l.375-7.5a2.25 2.25 0 012.246-2.094L9 9.375h6l3.371.181a2.25 2.25 0 012.25 2.094l.375 7.5M9.75 8.625l-.26-2.338A2.25 2.25 0 0111.728 4.1h2.544a2.25 2.25 0 012.237 2.186l-.26 2.339"
    />
  </svg>
);

const RulerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 mr-1"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
    />
  </svg>
);

export interface PropertyCardProps {
  image?: string;
  price?: string;
  originalPrice?: string;
  address?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  tag?: string;
  transport?: string;
  floorPlan?: string;
  areaSize?: string;
  expectedRent?: string;
  yearBuilt?: string;
  variant?: "vertical" | "horizontal";
  selected?: boolean;
  onCardClick?: () => void;
  detailPageId?: string;
  itemId?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  __stackpage?: StackPageRuntimeApi;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  image = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  price = "$850,000",
  originalPrice,
  address = "123 Palm Avenue, Beverly Hills, CA 90210",
  beds = 3,
  baths = 2,
  sqft = 2400,
  tag = "FOR SALE",
  transport,
  floorPlan,
  areaSize,
  expectedRent,
  yearBuilt,
  variant = "vertical",
  selected = false,
  onCardClick,
  detailPageId,
  itemId,
  backgroundColor,
  fontSize,
  className = "",
  style,
  __stackpage,
}) => {
  const t = useT();

  const mergedStyle: React.CSSProperties = {
    backgroundColor,
    fontSize,
    ...style,
  };

  const handleClick = () => {
    if (onCardClick) {
      onCardClick();
    } else if (__stackpage) {
      const item = { id: itemId || address, price, address, tag };
      setPageState(__stackpage, ESTATE_STATE_KEYS.selectedPropertyId, item.id);
      __stackpage.emit(ESTATE_EVENTS.propertySelected, buildPropertySelectionEvent(item));
    }
    if (detailPageId) {
      const id = itemId || address;
      window.location.href = `/view/${detailPageId}?item=${encodeURIComponent(id)}`;
    }
  };

  const selectedRing = selected ? "ring-2 ring-blue-400 ring-offset-2" : "";

  const tagElement = (
    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wide">
      {t(tag)}
    </span>
  );

  const hasJapaneseFields = transport || floorPlan || areaSize || expectedRent || originalPrice || yearBuilt;

  const priceSection = (
    <div className="mb-2">
      {originalPrice && (
        <div className="text-sm text-gray-400 line-through mb-0.5">{originalPrice}</div>
      )}
      <h3 className="text-xl font-bold text-gray-900">{price}</h3>
    </div>
  );

  const japaneseInfoRows = hasJapaneseFields && (
    <div className="space-y-1.5 mb-3">
      {transport && (
        <div className="flex items-start text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 mt-0.5 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <span className="text-xs text-gray-600">{transport}</span>
        </div>
      )}
      {(floorPlan || areaSize) && (
        <div className="flex items-center gap-2 text-xs text-gray-600">
          {floorPlan && <span className="font-medium">{floorPlan}</span>}
          {floorPlan && areaSize && <span className="text-gray-300">|</span>}
          {areaSize && <span>{areaSize}</span>}
        </div>
      )}
    </div>
  );

  const statsBar = hasJapaneseFields ? (
    <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-gray-600">
      {expectedRent && (
        <div className="text-xs">
          <span className="text-gray-400">{t("Rent")}: </span>
          <span className="font-semibold">{expectedRent}</span>
        </div>
      )}
      {yearBuilt && (
        <div className="text-xs text-gray-500">{yearBuilt}</div>
      )}
      {!expectedRent && !yearBuilt && (
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold">{beds} {t("Beds")}</span>
          <span className="text-gray-300">|</span>
          <span className="text-xs font-semibold">{baths} {t("Baths")}</span>
          <span className="text-gray-300">|</span>
          <span className="text-xs font-semibold">{sqft} {t("sqft")}</span>
        </div>
      )}
    </div>
  ) : (
    <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-gray-600 mt-auto">
      <div className="flex items-center">
        <BedIcon />
        <span className="text-xs font-semibold">{beds} {t("Beds")}</span>
      </div>
      <div className="h-3 w-px bg-gray-300 mx-2" />
      <div className="flex items-center">
        <BathIcon />
        <span className="text-xs font-semibold">{baths} {t("Baths")}</span>
      </div>
      <div className="h-3 w-px bg-gray-300 mx-2" />
      <div className="flex items-center">
        <RulerIcon />
        <span className="text-xs font-semibold">{sqft} {t("sqft")}</span>
      </div>
    </div>
  );

  const detailContent = (
    <>
      {priceSection}
      <div className="flex items-start mb-2 text-gray-500">
        <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
        <p className="text-sm font-medium line-clamp-1">{address}</p>
      </div>
      {japaneseInfoRows}
      {statsBar}
    </>
  );

  if (variant === "horizontal") {
    return (
      <div
        className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer flex flex-col sm:flex-row h-full sm:h-48 ${selectedRing} ${className}`}
        style={mergedStyle}
        onClick={handleClick}
      >
        <div className="relative w-full sm:w-2/5 h-48 sm:h-full overflow-hidden shrink-0">
          <img
            src={image}
            alt={address}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4">{tagElement}</div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-4 flex flex-col justify-center flex-grow">{detailContent}</div>
      </div>
    );
  }

  return (
    <div
      className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer flex flex-col h-full ${selectedRing} ${className}`}
      style={mergedStyle}
      onClick={handleClick}
    >
      <div className="relative h-[60%] min-h-[200px] flex-grow overflow-hidden">
        <img
          src={image}
          alt={address}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">{tagElement}</div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {selected && (
          <div className="absolute top-4 right-4">
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
              {t("Selected")}
            </span>
          </div>
        )}
      </div>
      <div className="p-6">{detailContent}</div>
    </div>
  );
};

export default PropertyCard;
