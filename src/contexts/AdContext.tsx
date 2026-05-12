import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREMIUM_STORAGE_KEY = '@is_premium';

/** Number of trips visible to free-tier users in Recent Trips */
export const FREE_TRIP_LIMIT = 3;

export interface AdContextType {
  isPremium: boolean;
  shouldShowAds: boolean;
  setPremium: (isPremium: boolean) => void;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

export const AdProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremiumState] = useState(false);

  // Restore persisted premium status on mount
  useEffect(() => {
    AsyncStorage.getItem(PREMIUM_STORAGE_KEY).then((val) => {
      if (val === 'true') setIsPremiumState(true);
    });
  }, []);

  const setPremium = (value: boolean) => {
    setIsPremiumState(value);
    AsyncStorage.setItem(PREMIUM_STORAGE_KEY, String(value));
  };

  const value: AdContextType = {
    isPremium,
    shouldShowAds: !isPremium,
    setPremium,
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
