import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/persistence/prisma/prisma.service';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AccessTokenPayload } from '../../domain/auth/ports/token.service.port';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('me')
  async me(@CurrentUser() user: AccessTokenPayload) {
    const row = await this.prisma.user.findUniqueOrThrow({
      where: { id: user.sub },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        locale: true,
        emailVerified: true,
        preferredAgentId: true,
      },
    });
    return row;
  }
}
