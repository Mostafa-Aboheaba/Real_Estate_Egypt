import { Controller, Get, UseGuards } from '@nestjs/common';
import { GetCurrentUserUseCase } from '../../application/users/get-current-user.use-case';
import { AccessTokenPayload } from '../../domain/auth/ports/token.service.port';
import { CurrentUser } from '../decorators/current-user.decorator';
import { EmailVerifiedGuard } from '../guards/email-verified.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard)
export class UsersController {
  constructor(private readonly getCurrentUser: GetCurrentUserUseCase) {}

  @Get('me')
  async me(@CurrentUser() user: AccessTokenPayload) {
    return this.getCurrentUser.execute(user.sub);
  }
}
