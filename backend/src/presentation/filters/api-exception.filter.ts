import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  AuthDomainException,
  AuthErrorCode,
} from '../../domain/auth/failures/auth.failures';
import {
  PropertyDomainException,
  PropertyErrorCode,
} from '../../domain/property/failures/property.failures';
import { CORRELATION_ID_HEADER } from '../../common/middleware/correlation-id.middleware';

const PROPERTY_STATUS: Record<PropertyErrorCode, number> = {
  [PropertyErrorCode.LISTING_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [PropertyErrorCode.INVALID_FILTERS]: HttpStatus.BAD_REQUEST,
};

const AUTH_STATUS: Record<AuthErrorCode, number> = {
  [AuthErrorCode.DUPLICATE_EMAIL]: HttpStatus.CONFLICT,
  [AuthErrorCode.INVALID_CREDENTIALS]: HttpStatus.UNAUTHORIZED,
  [AuthErrorCode.EMAIL_NOT_VERIFIED]: HttpStatus.FORBIDDEN,
  [AuthErrorCode.INVALID_TOKEN]: HttpStatus.BAD_REQUEST,
  [AuthErrorCode.TOKEN_EXPIRED]: HttpStatus.BAD_REQUEST,
  [AuthErrorCode.VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,
  [AuthErrorCode.OAUTH_NOT_CONFIGURED]: HttpStatus.SERVICE_UNAVAILABLE,
  [AuthErrorCode.OAUTH_INVALID]: HttpStatus.BAD_REQUEST,
  [AuthErrorCode.CONSENT_REQUIRED]: HttpStatus.BAD_REQUEST,
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { correlationId?: string }>();

    const correlationId = request.correlationId ?? 'unknown';

    if (exception instanceof PropertyDomainException) {
      const status = PROPERTY_STATUS[exception.code] ?? HttpStatus.BAD_REQUEST;
      response.status(status).json({
        error: {
          code: exception.code,
          message: exception.message,
          details: [],
          correlationId,
        },
      });
      return;
    }

    if (exception instanceof AuthDomainException) {
      const status = AUTH_STATUS[exception.code] ?? HttpStatus.BAD_REQUEST;
      response.status(status).json({
        error: {
          code: exception.code,
          message: exception.message,
          details: [],
          correlationId,
        },
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const message =
        typeof body === 'string'
          ? body
          : ((body as { message?: string | string[] }).message ?? 'Error');

      response.status(status).json({
        error: {
          code: 'HTTP_ERROR',
          message: Array.isArray(message) ? message.join(', ') : message,
          details: [],
          correlationId,
        },
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        details: [],
        correlationId,
      },
    });
  }
}
