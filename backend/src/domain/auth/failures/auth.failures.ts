export enum AuthErrorCode {
  DUPLICATE_EMAIL = 'DUPLICATE_EMAIL',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  OAUTH_NOT_CONFIGURED = 'OAUTH_NOT_CONFIGURED',
  OAUTH_INVALID = 'OAUTH_INVALID',
  CONSENT_REQUIRED = 'CONSENT_REQUIRED',
}

export class AuthDomainException extends Error {
  constructor(
    public readonly code: AuthErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'AuthDomainException';
  }
}
