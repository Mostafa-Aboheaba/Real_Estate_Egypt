const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  private constructor(public readonly value: string) {}

  static create(raw: string): Email | null {
    const normalized = raw.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalized)) {
      return null;
    }
    return new Email(normalized);
  }
}
