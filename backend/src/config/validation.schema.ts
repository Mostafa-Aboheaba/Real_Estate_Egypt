import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  LOG_LEVEL: Joi.string()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace')
    .default('info'),
  JWT_SECRET: Joi.string().min(16).default('dev-only-change-in-production'),
  JWT_ACCESS_EXPIRES_SEC: Joi.number().default(900),
  JWT_REFRESH_EXPIRES_DAYS: Joi.number().default(7),
  // .env often sets these to "" before OAuth is configured
  GOOGLE_CLIENT_ID: Joi.string().allow('').optional(),
  APPLE_CLIENT_ID: Joi.string().allow('').optional(),
  PUBLIC_URL: Joi.string().uri().optional(),
  AUTH_DEV_AUTO_VERIFY_EMAIL: Joi.boolean().optional(),
  SHAETY_API_KEY: Joi.string().allow('').optional(),
  SHAETY_API_URL: Joi.string().uri().optional(),
  SHAETY_OS_TYPE: Joi.string().valid('ios', 'android').optional(),
  GEMINI_API_KEY: Joi.string().allow('').optional(),
  GEMINI_MOCK_CHAT: Joi.boolean().optional(),
  GEMINI_MOCK_EMBEDDINGS: Joi.boolean().optional(),
  GENUI_ENABLED: Joi.boolean().optional(),
  GEMINI_EMBED_MAX_RETRIES: Joi.number().optional(),
  RAG_CACHE_TTL_SEC: Joi.number().optional(),
  RAG_SKIP_FAQ_INGEST: Joi.boolean().optional(),
});
