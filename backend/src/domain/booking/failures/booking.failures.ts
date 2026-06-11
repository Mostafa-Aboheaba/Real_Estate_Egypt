export enum BookingErrorCode {
  BOOKING_NOT_FOUND = 'BOOKING_NOT_FOUND',
  PROPERTY_NOT_FOUND = 'PROPERTY_NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TRANSITION = 'INVALID_TRANSITION',
  SLOT_UNAVAILABLE = 'SLOT_UNAVAILABLE',
  AGENT_QUOTA_EXCEEDED = 'AGENT_QUOTA_EXCEEDED',
  CANCEL_WINDOW_CLOSED = 'CANCEL_WINDOW_CLOSED',
  DUPLICATE_REQUEST = 'DUPLICATE_REQUEST',
}

export class BookingDomainException extends Error {
  constructor(
    public readonly code: BookingErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'BookingDomainException';
  }
}
