export enum RagErrorCode {
  EMBEDDING_FAILED = 'EMBEDDING_FAILED',
  RETRIEVAL_FAILED = 'RETRIEVAL_FAILED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export class RagDomainException extends Error {
  constructor(
    public readonly code: RagErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'RagDomainException';
  }
}
