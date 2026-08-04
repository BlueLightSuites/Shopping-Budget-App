
import { ToastProvider } from 'react-native-toast-notifications';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { AdProvider } from './src/contexts/AdContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { useEffect } from 'react';
import Qonversion, { QonversionConfigBuilder, LaunchMode, Environment } from '@qonversion/react-native-sdk';
import Constants from 'expo-constants';

const QONVERSION_PROJECT_KEY = Constants.expoConfig?.extra?.QONVERSION_PROJECT_KEY ?? '';

function PurchasesConfig() {
  useEffect(() => {
    // @qonversion/react-native-sdk requires a native build — it cannot run in Expo Go.
    // Use `npx expo run:ios` or `eas build` to test in-app purchases.
    const isExpoGo = Constants.executionEnvironment === 'storeClient';
    if (isExpoGo) {
      console.warn('[Qonversion] Skipping SDK init — native IAP is not supported in Expo Go. Build a dev client to test purchases.');
      return;
    }
    try {
      // Use SANDBOX only for local dev builds (__DEV__ === true).
      // For ALL signed builds — including TestFlight (preview/production profiles) and the App Store —
      // use PRODUCTION. TestFlight uses production-signed certificates and Apple automatically routes
      // IAP to its sandbox environment; explicitly setting Environment.SANDBOX on a TestFlight build
      // conflicts with that and causes QONErrorCodeProductNotFound (error 2).
      const isSandbox = __DEV__;
      const config = new QonversionConfigBuilder(QONVERSION_PROJECT_KEY, LaunchMode.SUBSCRIPTION_MANAGEMENT)
        .setEnvironment(isSandbox ? Environment.SANDBOX : Environment.PRODUCTION)
        .build();
      Qonversion.initialize(config);
    } catch (e) {
      console.warn('[Qonversion] Failed to configure SDK:', e);
    }
  }, []);
  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <PurchasesConfig />
      <AdProvider>
        <ToastProvider>
          <SafeAreaProvider>
            <StatusBar barStyle={'light-content'}/>
            <AppNavigator />
          </SafeAreaProvider>
        </ToastProvider>
      </AdProvider>
    </ThemeProvider>
  );
}