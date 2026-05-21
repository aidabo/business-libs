import React, { useState } from "react";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";
import { useOptimisticSharedStringInputState } from "./utils/stateHelpers";

export interface PropertyFilterBarProps {
  title?: string;
  description?: string;
  intentKey?: string;
  keywordKey?: string;
  activeIntent?: string;
  activeKeyword?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  __stackpage?: StackPageRuntimeApi;
}

export const ESTATE_FILTER_STATE_KEYS = {
  intent: "estate.filter.intent",
  keyword: "estate.keyword",
  priceMin: "estate.filter.priceMin",
  priceMax: "estate.filter.priceMax",
  depositMin: "estate.filter.depositMin",
  depositMax: "estate.filter.depositMax",
  keyMoneyMin: "estate.filter.keyMoneyMin",
  keyMoneyMax: "estate.filter.keyMoneyMax",
  yieldMin: "estate.filter.yieldMin",
  yieldMax: "estate.filter.yieldMax",
} as const;

const INTENTS = ["all", "sale", "rent", "investment"] as const;

interface FilterFieldProps {
  label: string;
  minPlaceholder: string;
  maxPlaceholder: string;
  minKey: string;
  maxKey: string;
  __stackpage?: StackPageRuntimeApi;
  prefix?: string;
  suffix?: string;
}

function RangeFilterFields({
  label,
  minPlaceholder,
  maxPlaceholder,
  minKey,
  maxKey,
  __stackpage,
  prefix = "",
  suffix = "",
}: FilterFieldProps) {
  const { value: minVal, setValue: setMin } = useOptimisticSharedStringInputState({
    stackpage: __stackpage,
    key: minKey,
    fallback: "",
  });
  const { value: maxVal, setValue: setMax } = useOptimisticSharedStringInputState({
    stackpage: __stackpage,
    key: maxKey,
    fallback: "",
  });

  const handleChange = (key: string, val: string, setter: (v: string) => void) => {
    // Only allow digits (numeric input)
    const cleaned = val.replace(/[^0-9]/g, "");
    setter(cleaned);
    __stackpage?.setPageState?.(key, cleaned);
    __stackpage?.emit?.("estate:filter:changed", { [key]: cleaned });
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <div className="flex items-center gap-2">
        {prefix && <span className="text-xs text-slate-500">{prefix}</span>}
        <input
          type="text"
          inputMode="numeric"
          value={minVal}
          onChange={(e) => handleChange(minKey, e.target.value, setMin)}
          placeholder={minPlaceholder}
          className="w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm outline-none transition focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
        />
        <span className="text-xs text-slate-400">~</span>
        <input
          type="text"
          inputMode="numeric"
          value={maxVal}
          onChange={(e) => handleChange(maxKey, e.target.value, setMax)}
          placeholder={maxPlaceholder}
          className="w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm outline-none transition focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
        />
        {suffix && <span className="text-xs text-slate-500">{suffix}</span>}
      </div>
    </div>
  );
}

/**
 * Label and descriptions map for intent buttons
 */
const INTENT_META: Record<string, { labelKey: string; badgeKey: string }> = {
  all: { labelKey: "All", badgeKey: "All properties" },
  sale: { labelKey: "For Sale", badgeKey: "sale" },
  rent: { labelKey: "For Rent", badgeKey: "rent" },
  investment: { labelKey: "Investment", badgeKey: "investment" },
};

export default function PropertyFilterBar({
  title = "Browse properties",
  description = "Filter the showcase by sale or rent, and narrow the results with a keyword.",
  intentKey = ESTATE_FILTER_STATE_KEYS.intent,
  keywordKey = ESTATE_FILTER_STATE_KEYS.keyword,
  activeIntent = "all",
  activeKeyword = "",
  backgroundColor,
  fontSize,
  className = "",
  style,
  __stackpage,
}: PropertyFilterBarProps) {
  const t = useT();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { value: keyword, setValue: setKeyword } = useOptimisticSharedStringInputState({
    stackpage: __stackpage,
    key: keywordKey,
    fallback: activeKeyword,
  });

  const currentIntent = String(
    __stackpage?.getPageState?.(intentKey, activeIntent) || activeIntent
  );

  const handleIntentChange = (intent: string) => {
    __stackpage?.setPageState?.(intentKey, intent);
    __stackpage?.emit?.("estate:filter:changed", { intent });
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setKeyword(val);
    __stackpage?.setPageState?.(keywordKey, val);
    __stackpage?.emit?.("estate:search:changed", { keyword: val, source: "filter-bar" });
  };

  const intentMeta = INTENT_META[currentIntent] || INTENT_META.all;

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
      style={{ backgroundColor, fontSize, ...style }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-50 via-white to-indigo-50 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
              {t("Filter bar")}
            </div>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">{t(title)}</h3>
            <p className="mt-1 text-sm text-slate-600">{t(description)}</p>
          </div>
          <span className="rounded-full border border-sky-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
            {t(intentMeta.badgeKey)}
          </span>
        </div>
      </div>

      {/* Intent buttons + keyword */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-4">
        <div className="flex flex-wrap gap-2">
          {INTENTS.map((intent) => (
            <button
              key={intent}
              type="button"
              onClick={() => handleIntentChange(intent)}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                currentIntent === intent
                  ? "border-sky-300 bg-sky-100 text-sky-800"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t(INTENT_META[intent]?.labelKey || intent)}
            </button>
          ))}
        </div>
        <div className="relative ml-auto flex-1 md:max-w-xs">
          <input
            type="text"
            value={keyword}
            onChange={handleKeywordChange}
            placeholder={t("Search properties...")}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 pr-10 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
          </span>
        </div>
      </div>

      {/* Per-category filter fields */}
      <div className="border-t border-slate-100">
        <button
          type="button"
          onClick={() => setDetailsOpen(!detailsOpen)}
          className="flex w-full items-center justify-between px-5 py-2.5 text-xs font-medium text-slate-500 transition hover:text-slate-700"
        >
          <span>{t("Detailed conditions")}</span>
          <span className={`transition ${detailsOpen ? "rotate-180" : ""}`}>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>

        {detailsOpen && (
          <div className="space-y-4 px-5 pb-4">
            {/* Price range — shown for all intents */}
            <RangeFilterFields
              label={t("Price range")}
              minPlaceholder={currentIntent === "rent" ? t("Min rent") : t("Min price")}
              maxPlaceholder={currentIntent === "rent" ? t("Max rent") : t("Max price")}
              minKey={ESTATE_FILTER_STATE_KEYS.priceMin}
              maxKey={ESTATE_FILTER_STATE_KEYS.priceMax}
              __stackpage={__stackpage}
              suffix={t("yen")}
            />

            {/* Rent-specific fields: deposit and key money */}
            {currentIntent === "rent" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <RangeFilterFields
                  label={t("Deposit (security deposit)")}
                  minPlaceholder={t("Min")}
                  maxPlaceholder={t("Max")}
                  minKey={ESTATE_FILTER_STATE_KEYS.depositMin}
                  maxKey={ESTATE_FILTER_STATE_KEYS.depositMax}
                  __stackpage={__stackpage}
                  suffix={t("yen")}
                />
                <RangeFilterFields
                  label={t("Key money")}
                  minPlaceholder={t("Min")}
                  maxPlaceholder={t("Max")}
                  minKey={ESTATE_FILTER_STATE_KEYS.keyMoneyMin}
                  maxKey={ESTATE_FILTER_STATE_KEYS.keyMoneyMax}
                  __stackpage={__stackpage}
                  suffix={t("yen")}
                />
              </div>
            )}

            {/* Investment-specific fields: yield */}
            {currentIntent === "investment" && (
              <RangeFilterFields
                label={t("Expected yield")}
                minPlaceholder={t("Min %")}
                maxPlaceholder={t("Max %")}
                minKey={ESTATE_FILTER_STATE_KEYS.yieldMin}
                maxKey={ESTATE_FILTER_STATE_KEYS.yieldMax}
                __stackpage={__stackpage}
                suffix="%"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
