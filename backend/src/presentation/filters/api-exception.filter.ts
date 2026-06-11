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
import {
  ProfileDomainException,
  ProfileErrorCode,
} from '../../domain/profile/failures/profile.failures';
import {
  RagDomainException,
  RagErrorCode,
} from '../../domain/rag/failures/rag.failures';
import {
  ChatDomainException,
  ChatErrorCode,
} from '../../domain/chat/failures/chat.failures';
import {
  RecommendationDomainException,
  RecommendationErrorCode,
} from '../../domain/recommendation/failures/recommendation.failures';
import { CORRELATION_ID_HEADER } from '../../common/middleware/correlation-id.middleware';

const PROPERTY_STATUS: Record<PropertyErrorCode, number> = {
  [PropertyErrorCode.LISTING_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [PropertyErrorCode.INVALID_FILTERS]: HttpStatus.BAD_REQUEST,
};

const PROFILE_STATUS: Record<ProfileErrorCode, number> = {
  [ProfileErrorCode.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ProfileErrorCode.VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,
  [ProfileErrorCode.INVALID_AGENT_ID]: HttpStatus.BAD_REQUEST,
  [ProfileErrorCode.FORBIDDEN]: HttpStatus.FORBIDDEN,
  [ProfileErrorCode.FAVORITE_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ProfileErrorCode.PROPERTY_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ProfileErrorCode.INVALID_CREDENTIALS]: HttpStatus.UNAUTHORIZED,
};

const RAG_STATUS: Record<RagErrorCode, number> = {
  [RagErrorCode.EMBEDDING_FAILED]: HttpStatus.BAD_GATEWAY,
  [RagErrorCode.RETRIEVAL_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
  [RagErrorCode.VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,
};

const CHAT_STATUS: Record<ChatErrorCode, number> = {
  [ChatErrorCode.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ChatErrorCode.VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,
  [ChatErrorCode.INVALID_AGENT_ID]: HttpStatus.BAD_REQUEST,
  [ChatErrorCode.FORBIDDEN]: HttpStatus.FORBIDDEN,
  [ChatErrorCode.AI_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
  [ChatErrorCode.AI_QUOTA_EXCEEDED]: HttpStatus.FORBIDDEN,
  [ChatErrorCode.RATE_LIMITED]: HttpStatus.TOO_MANY_REQUESTS,
};

const RECOMMENDATION_STATUS: Record<RecommendationErrorCode, number> = {
  [RecommendationErrorCode.VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,
  [RecommendationErrorCode.PROPERTY_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [RecommendationErrorCode.RECOMMENDATIONS_UNAVAILABLE]:
    HttpStatus.SERVICE_UNAVAILABLE,
  [RecommendationErrorCode.BLOCKED_FILTER_KEY]: HttpStatus.BAD_REQUEST,
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

    if (exception instanceof ProfileDomainException) {
      const status =
        PROFILE_STATUS[exception.code] ?? HttpStatus.BAD_REQUEST;
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

    if (exception instanceof RagDomainException) {
      const status = RAG_STATUS[exception.code] ?? HttpStatus.BAD_GATEWAY;
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

    if (exception instanceof ChatDomainException) {
      const status = CHAT_STATUS[exception.code] ?? HttpStatus.BAD_REQUEST;
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

    if (exception instanceof RecommendationDomainException) {
      const status =
        RECOMMENDATION_STATUS[exception.code] ?? HttpStatus.BAD_REQUEST;
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
