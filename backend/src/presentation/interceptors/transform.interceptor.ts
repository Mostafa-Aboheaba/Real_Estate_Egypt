import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<{ data: unknown }> {
    return next.handle().pipe(
      map((data) => {
        if (data === undefined || data === null) {
          return data;
        }
        if (
          typeof data === 'object' &&
          data !== null &&
          'data' in data &&
          'meta' in data
        ) {
          return data as { data: unknown; meta: unknown };
        }
        return { data };
      }),
    );
  }
}
