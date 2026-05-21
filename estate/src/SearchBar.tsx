import React, { useState, useCallback, useEffect, useRef } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";
import { ESTATE_STATE_KEYS, getPageState, setPageState } from "./types";
import { DEFAULT_SEARCHABLE_FIELDS, parseSearchQuery } from "./utils/search";

export interface SearchBarProps {
  placeholder?: string;
  buttonLabel?: string;
  keywordKey?: string;
  searchableFields?: string[];
  searchTargetLabel?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  __stackpage?: StackPageRuntimeApi;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  buttonLabel,
  keywordKey = ESTATE_STATE_KEYS.keyword,
  searchableFields,
  searchTargetLabel,
  backgroundColor,
  fontSize,
  className = "",
  style,
  __stackpage,
}) => {
  const t = useT();

  const externalKeyword = String(getPageState(__stackpage, keywordKey, ""));
  const [value, setValue] = useState(externalKeyword);
  const pendingRef = useRef<string | null>(null);
  const lastExternalRef = useRef(externalKeyword);

  useEffect(() => {
    if (externalKeyword === lastExternalRef.current) return;
    if (pendingRef.current !== null) {
      if (externalKeyword === pendingRef.current) {
        pendingRef.current = null;
        lastExternalRef.current = externalKeyword;
        return;
      }
      lastExternalRef.current = externalKeyword;
      return;
    }
    setValue(externalKeyword);
    lastExternalRef.current = externalKeyword;
  }, [externalKeyword]);

  const buildSearchPayload = useCallback(
    (q: string, submitted = false) => {
      const query = parseSearchQuery(q);
      return {
        q,
        keyword: q,
        tokens: query.tokens,
        target: searchableFields ?? DEFAULT_SEARCHABLE_FIELDS,
        targetLabel: searchTargetLabel ?? "",
        keywordKey,
        submitted,
      };
    },
    [keywordKey, searchableFields, searchTargetLabel]
  );

  const handleChange = useCallback(
    (nextValue: string) => {
      pendingRef.current = nextValue;
      setValue(nextValue);
      if (__stackpage) {
        setPageState(__stackpage, keywordKey, nextValue);
        __stackpage.emit("estate:search:changed", buildSearchPayload(nextValue, false));
      }
    },
    [__stackpage, keywordKey, buildSearchPayload]
  );

  const handleSubmit = useCallback(() => {
    if (__stackpage && value) {
      __stackpage.emit("estate:search:changed", buildSearchPayload(value, true));
    }
  }, [__stackpage, value, buildSearchPayload]);

  const mergedStyle: React.CSSProperties = {
    backgroundColor,
    fontSize,
    ...style,
  };

  const displayPlaceholder = placeholder ||
    (searchTargetLabel
      ? t("Search by ") + t(searchTargetLabel)
      : t("Search by location, price, or keyword..."));
  const displayButtonLabel = buttonLabel || t("Search");

  return (
    <div className={`w-full ${className}`} style={mergedStyle}>
      <div className="bg-white p-2 rounded-full shadow-md border border-gray-200 flex items-center ring-1 ring-gray-100 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
        <div className="pl-4 text-gray-400">
          <MagnifyingGlassIcon className="h-6 w-6" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          placeholder={displayPlaceholder}
          className="flex-grow px-4 py-3 text-gray-800 placeholder-gray-500 bg-transparent focus:outline-none text-lg"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-colors duration-200 shadow-sm"
        >
          {displayButtonLabel}
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
