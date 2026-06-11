/** Resolve chat locale from request header and stored user preference. */
export function resolveChatLocale(
  acceptLanguage?: string,
  userLocale?: string | null,
): string {
  const header = acceptLanguage?.trim().toLowerCase() ?? '';
  if (header.startsWith('ar')) {
    return 'ar-EG';
  }
  if (header.startsWith('en')) {
    return 'en';
  }

  const stored = userLocale?.trim().toLowerCase() ?? '';
  if (stored.startsWith('ar')) {
    return 'ar-EG';
  }
  if (stored.startsWith('en')) {
    return 'en';
  }

  return 'ar-EG';
}
