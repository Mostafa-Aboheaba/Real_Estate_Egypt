export type MessageRoleValue = 'user' | 'assistant' | 'system';

const VALID: MessageRoleValue[] = ['user', 'assistant', 'system'];

export class MessageRole {
  private constructor(readonly value: MessageRoleValue) {}

  static create(raw: string): MessageRole | null {
    if (!VALID.includes(raw as MessageRoleValue)) {
      return null;
    }
    return new MessageRole(raw as MessageRoleValue);
  }

  static user(): MessageRole {
    return new MessageRole('user');
  }

  static assistant(): MessageRole {
    return new MessageRole('assistant');
  }

  static system(): MessageRole {
    return new MessageRole('system');
  }

  isAssistant(): boolean {
    return this.value === 'assistant';
  }
}
