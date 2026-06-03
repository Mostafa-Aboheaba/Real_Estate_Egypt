import { Result } from './result';

describe('Result', () => {
  it('ok carries value', () => {
    const r = Result.ok(42);
    expect(r.isOk()).toBe(true);
    expect(r.value).toBe(42);
  });

  it('fail carries error', () => {
    const r = Result.fail('err');
    expect(r.isFail()).toBe(true);
    expect(r.error).toBe('err');
  });
});
