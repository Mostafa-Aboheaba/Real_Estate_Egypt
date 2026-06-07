import { Controller, Get, Headers, UseGuards } from '@nestjs/common';
import { ChatService } from '../../application/chat/chat.service';
import { UserRole } from '../../domain/auth/enums/user-role.enum';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../guards/email-verified.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('ai/agents')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard, RolesGuard)
export class AiAgentsController {
  constructor(private readonly chat: ChatService) {}

  @Get()
  @Roles(UserRole.Buyer, UserRole.Agent)
  async list(@Headers('accept-language') acceptLanguage?: string) {
    const locale = acceptLanguage?.startsWith('ar') ? 'ar-EG' : 'en';
    const agents = await this.chat.listAgents(locale);
    return agents.map((a) => ({ ...a, locale }));
  }
}
