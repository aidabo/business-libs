import React from "react";
import PropertyCard, { PropertyCardProps } from "./PropertyCard";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";
import {
  ESTATE_STATE_KEYS,
  getPageState,
  setPageState,
  buildPropertySelectionEvent,
} from "./types";
import {
  DEFAULT_SEARCHABLE_FIELDS,
  parseSearchQuery,
  propertyMatchesSearch,
  propertyMatchesIntent,
} from "./utils/search";

export interface PropertyGridProps {
  title?: string;
  description?: string;
  properties?: PropertyCardProps[];
  columns?: 2 | 3 | 4;
  layout?: "grid" | "list";
  selectedPropertyIdKey?: string;
  keywordKey?: string;
  intentKey?: string;
  searchableFields?: string[];
  detailPageId?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  __stackpage?: StackPageRuntimeApi;
}

const DEFAULT_PROPERTIES = Array(6).fill({
  image:
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  price: "$850,000",
  address: "123 Palm Avenue, Beverly Hills, CA 90210",
  beds: 3,
  baths: 2,
  sqft: 2400,
  tag: "FOR SALE",
});

const PropertyGrid: React.FC<PropertyGridProps> = ({
  title = "Featured Properties",
  description = "Explore our latest listings chosen for you.",
  properties = [],
  columns = 3,
  layout = "grid",
  selectedPropertyIdKey = ESTATE_STATE_KEYS.selectedPropertyId,
  keywordKey = ESTATE_STATE_KEYS.keyword,
  intentKey = ESTATE_STATE_KEYS.filterIntent,
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
  const activeIntent = String(getPageState(__stackpage, intentKey, "all")).toLowerCase();
  const selectedId = String(getPageState(__stackpage, selectedPropertyIdKey, ""));

  const displayProperties =
    properties.length > 0 ? properties : DEFAULT_PROPERTIES;

  const searchQuery = parseSearchQuery(keyword);

  const filteredProperties = displayProperties.filter((prop) => {
    const p = prop as Record<string, unknown>;
    if (!propertyMatchesIntent(p, activeIntent)) return false;
    return propertyMatchesSearch(p, searchQuery, searchableFields);
  });

  const handleCardClick = (prop: PropertyCardProps) => {
    if (__stackpage) {
      const item = { id: prop.address || "", price: prop.price, address: prop.address, tag: prop.tag };
      setPageState(__stackpage, selectedPropertyIdKey, item.id);
      __stackpage.emit("estate:property:selected", buildPropertySelectionEvent(item));
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

  const isList = layout === "list";

  return (
    <section className={`py-16 bg-gray-50 ${className}`} style={mergedStyle}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t(title)}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t(description)}
          </p>
          {__stackpage && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {t("Showing")} {filteredProperties.length} / {displayProperties.length}
              </span>
              {keyword && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  {t("Keyword:")} {keyword}
                </span>
              )}
              {activeIntent !== "all" && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  {t("Filter:")} {t(activeIntent)}
                </span>
              )}
            </div>
          )}
        </div>

        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t("No properties found matching your criteria.")}</p>
          </div>
        ) : (
          <div className={`grid gap-8 ${isList ? "grid-cols-1 max-w-4xl mx-auto" : `${gridColsClass[columns]} grid-cols-1`}`}>
            {filteredProperties.map((prop, index) => (
              <PropertyCard
                key={prop.address ? `${prop.address}-${index}` : index}
                {...prop}
                variant={isList ? "horizontal" : "vertical"}
                selected={!!prop.address && prop.address === selectedId}
                onCardClick={() => handleCardClick(prop)}
                detailPageId={detailPageId}
                itemId={prop.address || ""}
                __stackpage={__stackpage}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PropertyGrid;
