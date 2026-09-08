import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getQonversion } from '@/services/qonversion';

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

  // On mount, verify premium entitlements directly from Qonversion (server-authoritative).
  // Never rely solely on local storage — it can be tampered with on jailbroken devices.
  useEffect(() => {
    const qonversion = getQonversion();
    if (!qonversion) return; // Qonversion SDK not available in Expo Go
    qonversion.default.getSharedInstance()
      .checkEntitlements()
      .then((entitlements) => {
        const active = entitlements.get('premium_access')?.isActive ?? false;
        setIsPremiumState(active);
      })
      .catch((e) => {
        console.warn('[AdContext] Could not verify entitlements:', e);
        // Fail closed — default stays false (non-premium)
      });
  }, []);

  const setPremium = (value: boolean) => {
    // Optimistically update UI after a successful purchase; next launch re-verifies with Qonversion.
    setIsPremiumState(value);
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
