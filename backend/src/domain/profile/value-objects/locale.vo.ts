export type LocaleCode = 'ar-EG' | 'en';

const ALLOWED: LocaleCode[] = ['ar-EG', 'en'];

export class LocalePreference {
  private constructor(public readonly value: LocaleCode) {}

  static create(raw: string): LocalePreference | null {
    const normalized = raw.trim() as LocaleCode;
    if (!ALLOWED.includes(normalized)) {
      return null;
    }
    return new LocalePreference(normalized);
  }
}
