import React, { createContext, useContext } from 'react';

export type TranslateFn = (key: string) => string;
export type EstateLocale = "ja" | "en" | "zh";

interface EstateContextType {
  t: TranslateFn;
  locale: EstateLocale;
}

const EstateContext = createContext<EstateContextType | undefined>(undefined);

export const EstateProvider: React.FC<{ t: TranslateFn, locale?: string, children: React.ReactNode }> = ({ t, locale, children }) => {
  const normalizedLocale: EstateLocale = locale === "en" || locale === "zh" ? locale : "ja";
  return (
    <EstateContext.Provider value={{ t, locale: normalizedLocale }}>
      {children}
    </EstateContext.Provider>
  );
};

export const useEstateContext = () => {
  const context = useContext(EstateContext);
  if (!context) {
    // Graceful fallback if provider is missing
    console.warn('EstateProvider is missing. Translations will return keys.');
    return { t: (key: string) => key, locale: "ja" as EstateLocale };
  }
  return context;
};

export const useT = useEstateContext;
