import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class GuestSearchGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      user?: unknown;
      query?: { page?: string | number };
    }>();

    const page = Number(request.query?.page ?? 1);
    if (page > 1 && !request.user) {
      throw new UnauthorizedException('AUTH_REQUIRED');
    }

    return true;
  }
}
