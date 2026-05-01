import React, { createContext, useState, useContext, ReactNode } from 'react';

/** Number of trips visible to free-tier users in Recent Trips */
export const FREE_TRIP_LIMIT = 3;

export interface AdContextType {
  isPremium: boolean;
  shouldShowAds: boolean;
  setPremium: (isPremium: boolean) => void;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

export const AdProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);

  const value: AdContextType = {
    isPremium,
    shouldShowAds: !isPremium,
    setPremium: setIsPremium,
  };

  return (
    <AdContext.Provider value={value}>
      {children}
    </AdContext.Provider>
  );
};

export const useAds = (): AdContextType => {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error('useAds must be used within AdProvider');
  }
  return context;
};
