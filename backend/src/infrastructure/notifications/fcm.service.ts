import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface FcmMessage {
  token: string;
  title: string;
  body: string;
  data: Record<string, string>;
}

export interface FcmSendResult {
  success: boolean;
  invalidToken?: boolean;
  error?: string;
}

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);

  constructor(private readonly config: ConfigService) {}

  async send(message: FcmMessage): Promise<FcmSendResult> {
    const mock = this.config.get<boolean>('notifications.fcmMock', true);
    if (mock) {
      this.logger.log(
        `[FCM mock] token=${message.token.slice(0, 8)}… ` +
          `title=${message.title} data=${JSON.stringify(message.data)}`,
      );
      if (message.token === 'invalid-token') {
        return { success: false, invalidToken: true, error: 'invalid token' };
      }
      return { success: true };
    }

    // Production FCM HTTP v1 would be wired here.
    this.logger.warn('FCM mock disabled but live sender not configured');
    return { success: false, error: 'FCM not configured' };
  }
}
