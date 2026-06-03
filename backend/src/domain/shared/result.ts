export class Result<T, E = Error> {
  private constructor(
    public readonly ok: boolean,
    public readonly value?: T,
    public readonly error?: E,
  ) {}

  static ok<T>(value: T): Result<T, never> {
    return new Result(true, value);
  }

  static fail<E>(error: E): Result<never, E> {
    return new Result<never, E>(false, undefined, error);
  }

  isOk(): this is Result<T, never> {
    return this.ok;
  }

  isFail(): this is Result<never, E> {
    return !this.ok;
  }
}
