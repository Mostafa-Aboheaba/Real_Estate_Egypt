import { Password } from './password.vo';

describe('Password', () => {
  it('accepts 8+ characters', () => {
    expect(Password.create('12345678')).not.toBeNull();
  });

  it('rejects short password', () => {
    expect(Password.create('short')).toBeNull();
  });
});
