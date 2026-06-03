import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TOKEN_SERVICE, TokenServicePort } from '../../domain/auth/ports/token.service.port';
import { Inject } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
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
      throw new UnauthorizedException('UNAUTHORIZED');
    }

    const token = header.slice(7);
    const payload = this.tokens.verifyAccessToken(token);
    if (!payload) {
      throw new UnauthorizedException('UNAUTHORIZED');
    }

    request.user = payload;
    return true;
  }
}
