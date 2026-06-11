export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  databaseUrl: process.env.DATABASE_URL,
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  },
  logLevel: process.env.LOG_LEVEL ?? 'info',
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-only-change-in-production',
    accessExpiresSec: parseInt(process.env.JWT_ACCESS_EXPIRES_SEC ?? '900', 10),
    refreshExpiresDays: parseInt(
      process.env.JWT_REFRESH_EXPIRES_DAYS ?? '7',
      10,
    ),
  },
  oauth: {
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    appleClientId: process.env.APPLE_CLIENT_ID,
  },
  app: {
    publicUrl: process.env.PUBLIC_URL ?? 'http://localhost:3000',
  },
  auth: {
    // In development, emails are logged only — auto-verify unless explicitly disabled.
    devAutoVerifyEmail: (() => {
      if (process.env.AUTH_DEV_AUTO_VERIFY_EMAIL === 'false') {
        return false;
      }
      if (process.env.AUTH_DEV_AUTO_VERIFY_EMAIL === 'true') {
        return true;
      }
      return process.env.NODE_ENV !== 'production';
    })(),
  },
  listing: {
    shaetyApiKey: process.env.SHAETY_API_KEY,
    shaetyApiUrl:
      process.env.SHAETY_API_URL ?? 'https://app.shaety.com',
    shaetyOsType: process.env.SHAETY_OS_TYPE ?? 'android',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    mockEmbeddings:
      process.env.GEMINI_MOCK_EMBEDDINGS === 'true' ||
      !process.env.GEMINI_API_KEY,
    mockChat:
      process.env.GEMINI_MOCK_CHAT === 'true' ||
      !process.env.GEMINI_API_KEY,
    embedMaxRetries: parseInt(process.env.GEMINI_EMBED_MAX_RETRIES ?? '3', 10),
  },
  genui: {
    enabled: (() => {
      if (process.env.GENUI_ENABLED === 'false') {
        return false;
      }
      if (process.env.GENUI_ENABLED === 'true') {
        return true;
      }
      return process.env.NODE_ENV !== 'production';
    })(),
  },
  rag: {
    cacheTtlSec: parseInt(process.env.RAG_CACHE_TTL_SEC ?? '900', 10),
  },
});
