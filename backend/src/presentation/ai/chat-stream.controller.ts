import {
  Body,
  Controller,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ChatService } from '../../application/chat/chat.service';
import { UserRole } from '../../domain/auth/enums/user-role.enum';
import { AccessTokenPayload } from '../../domain/auth/ports/token.service.port';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Roles } from '../decorators/roles.decorator';
import { EmailVerifiedGuard } from '../guards/email-verified.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('conversations')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard, RolesGuard)
export class ChatStreamController {
  constructor(private readonly chat: ChatService) {}

  @Post(':id/messages/stream')
  @Roles(UserRole.Buyer, UserRole.Agent)
  async stream(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendMessageDto,
    @Headers('accept-language') acceptLanguage: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const locale = acceptLanguage?.startsWith('ar') ? 'ar-EG' : 'en';
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const controller = new AbortController();
    req.on('close', () => controller.abort());

    const write = (event: string, data: Record<string, unknown>) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      await this.chat.streamMessage(
        user.sub,
        id,
        dto.content,
        locale,
        write,
        controller.signal,
      );
    } catch {
      write('error', {
        code: 'AI_UNAVAILABLE',
        message: 'AI assistant is temporarily unavailable',
      });
    }

    res.end();
  }
}
