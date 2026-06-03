import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request & { correlationId?: string }>();
    const res = http.getResponse<{ statusCode: number }>();
    const start = Date.now();

    const correlationId = req.correlationId ?? 'unknown';

    const method = (req as Request).method;
    const url = (req as Request).url;

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - start;
        console.log(
          JSON.stringify({
            level: 'info',
            msg: 'request_completed',
            correlationId,
            method,
            url,
            statusCode: res.statusCode,
            durationMs,
          }),
        );
      }),
    );
  }
}
