import { MessageRole } from '../../../../src/domain/chat/value-objects/message-role.vo';

describe('MessageRole', () => {
  it('accepts valid roles', () => {
    expect(MessageRole.create('user')?.value).toBe('user');
    expect(MessageRole.create('assistant')?.value).toBe('assistant');
    expect(MessageRole.create('system')?.value).toBe('system');
  });

  it('rejects invalid roles', () => {
    expect(MessageRole.create('bot')).toBeNull();
    expect(MessageRole.create('')).toBeNull();
  });
});
