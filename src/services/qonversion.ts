import Constants from 'expo-constants';

type QonversionModule = typeof import('@qonversion/react-native-sdk');

/**
 * True when running inside the Expo Go client rather than a native/dev build.
 * Expo Go ships a fixed set of native modules, so anything outside that set
 * (Qonversion included) is simply not present at runtime.
 */
export const isExpoGo = Constants.executionEnvironment === 'storeClient';

let cached: QonversionModule | null = null;

/**
 * Lazily loads the Qonversion SDK, returning null in Expo Go.
 *
 * The SDK resolves its native module with `TurboModuleRegistry.getEnforcing`
 * at *import* time, which throws immediately when the native module is absent.
 * A static `import` therefore crashes the whole bundle in Expo Go before any
 * runtime guard can run — so every call site must go through this helper and
 * handle a null result instead of importing the package directly.
 */
export function getQonversion(): QonversionModule | null {
  if (isExpoGo) return null;
  if (!cached) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    cached = require('@qonversion/react-native-sdk') as QonversionModule;
  }
  return cached;
}
