/** Production Shaety API host (matches mobile `EndPoints.baseUrl`). */
export const SHAETY_DEFAULT_BASE_URL = 'https://app.shaety.com';

/** Laravel API prefix (`EndPoints.api` → `{baseUrl}/api/`). */
export const SHAETY_API_PREFIX = '/api';

/** Relative to API root (`EndPoints.properties`). */
export const SHAETY_PROPERTIES_SEGMENT = 'properties';

/** Guest token bootstrap (`EndPoints.fcmGuest`). */
export const SHAETY_FCM_HASH_SEGMENT = 'fcm-hash';

/** Default `os_type` for `POST /fcm-hash` (ios | android). */
export const SHAETY_DEFAULT_OS_TYPE = 'android';

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

