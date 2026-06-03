import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../domain/auth/enums/user-role.enum';
import { AccessTokenPayload } from '../../domain/auth/ports/token.service.port';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: AccessTokenPayload }>();
    const user = request.user;
    if (!user || !required.includes(user.role as UserRole)) {
      throw new ForbiddenException('FORBIDDEN');
    }

    return true;
  }
}
