export enum ChatErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_AGENT_ID = 'INVALID_AGENT_ID',
  FORBIDDEN = 'FORBIDDEN',
  AI_UNAVAILABLE = 'AI_UNAVAILABLE',
  AI_QUOTA_EXCEEDED = 'AI_QUOTA_EXCEEDED',
  RATE_LIMITED = 'RATE_LIMITED',
}

export class ChatDomainException extends Error {
  constructor(
    public readonly code: ChatErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'ChatDomainException';
  }
}
