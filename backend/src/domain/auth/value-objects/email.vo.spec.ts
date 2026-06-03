import { Email } from './email.vo';

describe('Email', () => {
  it('accepts valid email', () => {
    const email = Email.create('User@Example.com');
    expect(email?.value).toBe('user@example.com');
  });

  it('rejects invalid email', () => {
    expect(Email.create('not-an-email')).toBeNull();
  });
});
