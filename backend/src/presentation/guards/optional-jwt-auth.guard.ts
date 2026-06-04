import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  TOKEN_SERVICE,
  TokenServicePort,
} from '../../domain/auth/ports/token.service.port';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenServicePort,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: unknown;
    }>();

    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return true;
    }

    const token = header.slice(7);
    const payload = this.tokens.verifyAccessToken(token);
    if (payload) {
      request.user = payload;
    }

    return true;
  }
}
