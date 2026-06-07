import {
  Body,
  Controller,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from '../../application/chat/chat.service';
import { UserRole } from '../../domain/auth/enums/user-role.enum';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { PatchAdminAgentDto } from './dto/patch-admin-agent.dto';

@Controller('admin/agents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminAgentsController {
  constructor(private readonly chat: ChatService) {}

  @Patch(':agentId')
  @Roles(UserRole.Admin)
  async patchAgent(
    @Param('agentId') agentId: string,
    @Body() dto: PatchAdminAgentDto,
  ) {
    await this.chat.setAgentActive(agentId, dto.isActive);
    return { data: { id: agentId, isActive: dto.isActive } };
  }
}
