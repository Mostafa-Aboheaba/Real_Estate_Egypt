/** Production Shaety API host (matches mobile `EndPoints.baseUrl`). */
export const SHAETY_DEFAULT_BASE_URL = 'https://shaety.pountech.com';

/** Laravel API prefix (`EndPoints.api` → `{baseUrl}/api/`). */
export const SHAETY_API_PREFIX = '/api';

/** Relative to API root (`EndPoints.properties`). */
export const SHAETY_PROPERTIES_SEGMENT = 'properties';

/** Full path from host root for logging. */
export const SHAETY_PROPERTIES_PATH = `${SHAETY_API_PREFIX}/${SHAETY_PROPERTIES_SEGMENT}`;

/** Resolves `SHAETY_API_URL` to the API root (with `/api` suffix). */
export function normalizeShaetyApiRoot(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/$/, '');
  if (trimmed.endsWith(SHAETY_API_PREFIX)) {
    return trimmed;
  }
  return `${trimmed}${SHAETY_API_PREFIX}`;
}

/** Page size used by Shaety mobile API samples. */
export const SHAETY_DEFAULT_PER_PAGE = 15;

/** Safety cap for full-catalog sync pagination. */
export const SHAETY_MAX_SYNC_PAGES = 200;

/** Guest/mobile client headers (CORS-allowed on Shaety API). */
export const SHAETY_DEFAULT_PLATFORM = 'android';
export const SHAETY_DEFAULT_APP_VERSION = '1.0.0';
