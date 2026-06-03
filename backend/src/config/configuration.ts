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
});
