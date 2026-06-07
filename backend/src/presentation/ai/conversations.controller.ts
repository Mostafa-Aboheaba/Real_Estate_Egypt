import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from '../../application/chat/chat.service';
import { UserRole } from '../../domain/auth/enums/user-role.enum';
import { AccessTokenPayload } from '../../domain/auth/ports/token.service.port';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Roles } from '../decorators/roles.decorator';
import { EmailVerifiedGuard } from '../guards/email-verified.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ListConversationsQueryDto } from './dto/list-conversations-query.dto';
import { ListMessagesQueryDto } from './dto/list-messages-query.dto';
import { PatchConversationDto } from './dto/patch-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('conversations')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard, RolesGuard)
export class ConversationsController {
  constructor(private readonly chat: ChatService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.Buyer, UserRole.Agent)
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateConversationDto,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = acceptLanguage?.startsWith('ar') ? 'ar-EG' : 'en';
    const result = await this.chat.createConversation(
      user.sub,
      dto.agentId,
      dto.title,
      locale,
    );
    return result.conversation;
  }

  @Get()
  @Roles(UserRole.Buyer, UserRole.Agent)
  async list(
    @CurrentUser() user: AccessTokenPayload,
    @Query() query: ListConversationsQueryDto,
  ) {
    const page = await this.chat.listConversations(
      user.sub,
      query.page ?? 1,
      query.pageSize ?? 20,
      query.archived ?? false,
    );
    return page.items;
  }

  @Get(':id')
  @Roles(UserRole.Buyer, UserRole.Agent)
  async getOne(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.chat.getConversation(user.sub, id);
  }

  @Patch(':id')
  @Roles(UserRole.Buyer, UserRole.Agent)
  async patch(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PatchConversationDto,
  ) {
    return this.chat.patchConversation(user.sub, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.Buyer, UserRole.Agent)
  async remove(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.chat.deleteConversation(user.sub, id);
  }

  @Get(':id/messages')
  @Roles(UserRole.Buyer, UserRole.Agent)
  async listMessages(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: ListMessagesQueryDto,
  ) {
    const page = await this.chat.listMessages(
      user.sub,
      id,
      query.cursor,
      query.limit ?? 50,
    );
    return page;
  }

  @Post(':id/messages')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.Buyer, UserRole.Agent)
  async sendMessage(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendMessageDto,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = acceptLanguage?.startsWith('ar') ? 'ar-EG' : 'en';
    return this.chat.sendMessage(user.sub, id, dto.content, locale);
  }
}
