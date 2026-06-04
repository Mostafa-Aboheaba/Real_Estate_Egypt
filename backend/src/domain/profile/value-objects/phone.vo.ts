const PHONE_REGEX = /^(\+20|0)1[0-9]{9}$/;

export class Phone {
  private constructor(public readonly value: string) {}

  static create(raw: string): Phone | null {
    const trimmed = raw.trim();
    if (!PHONE_REGEX.test(trimmed)) {
      return null;
    }
    const normalized = trimmed.startsWith('0')
      ? `+20${trimmed.slice(1)}`
      : trimmed;
    return new Phone(normalized);
  }
}
