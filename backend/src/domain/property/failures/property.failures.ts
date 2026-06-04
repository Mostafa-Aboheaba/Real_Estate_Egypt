export enum PropertyErrorCode {
  LISTING_NOT_FOUND = 'LISTING_NOT_FOUND',
  INVALID_FILTERS = 'INVALID_FILTERS',
}

export class PropertyDomainException extends Error {
  constructor(
    public readonly code: PropertyErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'PropertyDomainException';
  }
}
