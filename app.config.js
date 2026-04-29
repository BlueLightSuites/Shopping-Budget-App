// Dynamic Expo config — reads secrets from .env (never commit .env to git).
// Expo automatically loads .env during `expo start` and `eas build`.
export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    KROGER_CLIENT_SECRET: process.env.KROGER_CLIENT_SECRET,
    KROGER_BASIC_TOKEN: process.env.KROGER_BASIC_TOKEN,
  },
});
