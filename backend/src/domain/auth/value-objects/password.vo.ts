const MIN_LENGTH = 8;

export class Password {
  private constructor(public readonly value: string) {}

  static create(raw: string): Password | null {
    if (raw.length < MIN_LENGTH) {
      return null;
    }
    return new Password(raw);
  }
}
