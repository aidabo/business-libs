import React, { createContext, useContext } from 'react';

export type TranslateFn = (key: string) => string;

interface EstateContextType {
  t: TranslateFn;
}

const EstateContext = createContext<EstateContextType | undefined>(undefined);

export const EstateProvider: React.FC<{ t: TranslateFn, children: React.ReactNode }> = ({ t, children }) => {
  return (
    <EstateContext.Provider value={{ t }}>
      {children}
    </EstateContext.Provider>
  );
};

export const useEstateContext = () => {
  const context = useContext(EstateContext);
  if (!context) {
    // Graceful fallback if provider is missing
    console.warn('EstateProvider is missing. Translations will return keys.');
    return { t: (key: string) => key };
  }
  return context;
};

export const useT = useEstateContext;
