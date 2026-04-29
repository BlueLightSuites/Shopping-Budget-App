// Dynamic Expo config — reads secrets from .env (never commit .env to git).
// Expo automatically loads .env during `expo start` and `eas build`.
export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    KROGER_CLIENT_SECRET: process.env.KROGER_CLIENT_SECRET,
    KROGER_BASIC_TOKEN: process.env.KROGER_BASIC_TOKEN,
    WALMART_CONSUMER_ID: process.env.WALMART_CONSUMER_ID,
    WALMART_KEY_VERSION: process.env.WALMART_KEY_VERSION,
    WALMART_PRIVATE_KEY_BASE64: process.env.WALMART_PRIVATE_KEY_BASE64,
  },
});
