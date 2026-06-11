import { resolveChatLocale } from './chat-locale';

describe('resolveChatLocale', () => {
  it('prefers Accept-Language header', () => {
    expect(resolveChatLocale('ar-EG', 'en')).toBe('ar-EG');
    expect(resolveChatLocale('en-US', 'ar-EG')).toBe('en');
  });

  it('falls back to stored user locale', () => {
    expect(resolveChatLocale(undefined, 'ar-EG')).toBe('ar-EG');
    expect(resolveChatLocale('', 'en')).toBe('en');
  });

  it('defaults to ar-EG for Egypt app', () => {
    expect(resolveChatLocale(undefined, null)).toBe('ar-EG');
  });
});
