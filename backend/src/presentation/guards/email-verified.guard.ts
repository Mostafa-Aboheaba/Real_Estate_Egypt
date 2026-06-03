import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import {
  AuthDomainException,
  AuthErrorCode,
} from '../../domain/auth/failures/auth.failures';
import { AccessTokenPayload } from '../../domain/auth/ports/token.service.port';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: AccessTokenPayload }>();
    const user = request.user;
    if (!user?.emailVerified) {
      throw new AuthDomainException(AuthErrorCode.EMAIL_NOT_VERIFIED);
    }
    return true;
  }
}
