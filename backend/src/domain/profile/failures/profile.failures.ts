export enum ProfileErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_AGENT_ID = 'INVALID_AGENT_ID',
  FORBIDDEN = 'FORBIDDEN',
  FAVORITE_NOT_FOUND = 'FAVORITE_NOT_FOUND',
  PROPERTY_NOT_FOUND = 'PROPERTY_NOT_FOUND',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
}

export class ProfileDomainException extends Error {
  constructor(
    public readonly code: ProfileErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'ProfileDomainException';
  }
}
