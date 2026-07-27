import React, { createContext, useContext } from 'react';

export type TranslateFn = (key: string) => string;

interface PersonContextType {
  t: TranslateFn;
}

const PersonContext = createContext<PersonContextType | undefined>(undefined);

export const PersonProvider: React.FC<{ t: TranslateFn; children: React.ReactNode }> = ({
  t,
  children,
}) => {
  return <PersonContext.Provider value={{ t }}>{children}</PersonContext.Provider>;
};

export const usePersonContext = () => {
  const context = useContext(PersonContext);
  if (!context) {
    console.warn('PersonProvider is missing. Translations will return keys.');
    return { t: (key: string) => key };
  }
  return context;
};

export const useT = usePersonContext;
