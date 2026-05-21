import React from "react";
import PropertyCard, { PropertyCardProps } from "./PropertyCard";
import { useT } from "./hooks/useTranslation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import type { StackPageRuntimeApi } from "./types";
import { ESTATE_STATE_KEYS, ESTATE_EVENTS, getPageState, setPageState, buildPropertySelectionEvent } from "./types";
import {
  DEFAULT_SEARCHABLE_FIELDS,
  parseSearchQuery,
  propertyMatchesSearch,
} from "./utils/search";

export interface SearchResultProps {
  title?: string;
  results?: PropertyCardProps[];
  totalCount?: number;
  columns?: 2 | 3 | 4;
  keywordKey?: string;
  selectedPropertyIdKey?: string;
  searchableFields?: string[];
  detailPageId?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  __stackpage?: StackPageRuntimeApi;
}

const FALLBACK_RESULTS = Array(9).fill({
  image:
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  price: "$850,000",
  address: "123 Palm Avenue, Beverly Hills, CA 90210",
  beds: 3,
  baths: 2,
  sqft: 2400,
  tag: "FOR SALE",
});

const SearchResult: React.FC<SearchResultProps> = ({
  title = "Search Results",
  results = [],
  totalCount: _totalCount = 0,
  columns = 3,
  keywordKey = ESTATE_STATE_KEYS.keyword,
  selectedPropertyIdKey = ESTATE_STATE_KEYS.selectedPropertyId,
  searchableFields = DEFAULT_SEARCHABLE_FIELDS,
  detailPageId,
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

  const keyword = String(getPageState(__stackpage, keywordKey, "")).trim();
  const selectedId = String(getPageState(__stackpage, selectedPropertyIdKey, ""));

  const isPreview = results.length === 0;
  const displayResults = isPreview ? FALLBACK_RESULTS : results;

  const searchQuery = parseSearchQuery(keyword);

  const filteredResults = keyword
    ? displayResults.filter((prop) =>
        propertyMatchesSearch(prop as Record<string, unknown>, searchQuery, searchableFields)
      )
    : displayResults;

  const handleCardClick = (prop: PropertyCardProps) => {
    if (__stackpage) {
      const item = { id: prop.address || "", price: prop.price, address: prop.address, tag: prop.tag };
      setPageState(__stackpage, selectedPropertyIdKey, item.id);
      __stackpage.emit(ESTATE_EVENTS.propertySelected, buildPropertySelectionEvent(item, "search"));
    }
    if (detailPageId) {
      const id = prop.address || "";
      window.location.href = `/view/${detailPageId}?item=${encodeURIComponent(id)}`;
    }
  };

  const gridColsClass = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section className={`py-12 w-full h-full ${className}`} style={mergedStyle}>
      <div className="w-full h-full px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t(title)}</h2>
            <div className="flex items-center text-gray-600">
              <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
              <span>
                {filteredResults.length} {t("results found")}
                {keyword && (
                  <span className="ml-2 text-gray-400">
                    {t('for')} "{keyword}"
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {filteredResults.length > 0 ? (
          <div className={`grid grid-cols-1 ${gridColsClass[columns]} gap-8`}>
            {filteredResults.map((prop, index) => (
              <PropertyCard
                key={index}
                {...prop}
                variant="vertical"
                selected={!!prop.address && prop.address === selectedId}
                onCardClick={() => handleCardClick(prop)}
                detailPageId={detailPageId}
                itemId={prop.address || ""}
                __stackpage={__stackpage}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">{t("No properties found matching your criteria.")}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchResult;
