import React, { createContext, useContext } from "react";

export type TranslateFn = (key: string) => string;

interface PortalContextType {
  t: TranslateFn;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export const PortalProvider: React.FC<{
  t: TranslateFn;
  children: React.ReactNode;
}> = ({ t, children }) => {
  return <PortalContext.Provider value={{ t }}>{children}</PortalContext.Provider>;
};

export const usePortalContext = () => {
  const context = useContext(PortalContext);
  if (!context) {
    return { t: (key: string) => key };
  }
  return context;
};
