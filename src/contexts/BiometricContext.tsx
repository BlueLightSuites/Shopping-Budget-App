import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const BIOMETRIC_ENABLED_KEY = '@biometric_enabled';

interface BiometricContextType {
  /** Whether the user has opted-in to biometric lock */
  biometricEnabled: boolean;
  /** Whether the app is currently locked (awaiting auth) */
  isLocked: boolean;
  /** Whether the device supports biometrics at all */
  isSupported: boolean;
  /** Toggle biometric lock on/off from Settings */
  toggleBiometric: (enabled: boolean) => Promise<void>;
  /** Trigger an authentication prompt and unlock on success */
  authenticate: () => Promise<boolean>;
  /** Lock the app manually */
  lock: () => void;
}

const BiometricContext = createContext<BiometricContextType | undefined>(undefined);

export const BiometricProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // On mount: check hardware support & load persisted preference
  useEffect(() => {
    const init = async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const supported = compatible && enrolled;
      setIsSupported(supported);

      if (supported) {
        const stored = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
        const enabled = stored === 'true';
        setBiometricEnabled(enabled);
        if (enabled) {
          // Lock the app on every cold start when enabled
          setIsLocked(true);
        }
      }
    };

    init();
  }, []);

  const authenticate = useCallback(async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Price Scanner',
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsLocked(false);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const toggleBiometric = useCallback(async (enabled: boolean) => {
    if (enabled) {
      if (!isSupported) {
        Alert.alert(
          'Not Available',
          'Biometric authentication is not set up on this device. Please enroll Face ID or a fingerprint in your device Settings first.',
        );
        return;
      }

      // Verify they can actually authenticate before enabling
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm your identity to enable biometric lock',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (!result.success) return; // user cancelled or failed — don't enable
    }

    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, String(enabled));
    setBiometricEnabled(enabled);
  }, [isSupported]);

  const lock = useCallback(() => {
    if (biometricEnabled) setIsLocked(true);
  }, [biometricEnabled]);

  return (
    <BiometricContext.Provider
      value={{ biometricEnabled, isLocked, isSupported, toggleBiometric, authenticate, lock }}
    >
      {children}
    </BiometricContext.Provider>
  );
};

export const useBiometric = (): BiometricContextType => {
  const ctx = useContext(BiometricContext);
  if (!ctx) throw new Error('useBiometric must be used within BiometricProvider');
  return ctx;
};
