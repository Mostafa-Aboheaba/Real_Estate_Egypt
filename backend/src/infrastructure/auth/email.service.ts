import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {}

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const baseUrl = this.config.get<string>(
      'app.publicUrl',
      'http://localhost:3000',
    );
    const link = `${baseUrl}/api/v1/auth/verify-email?token=${token}`;
    this.logger.warn(
      `Verification email (dev — not sent via SMTP). Open this link in a browser:\n` +
        `  ${link}`,
    );
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const baseUrl = this.config.get<string>(
      'app.publicUrl',
      'http://localhost:3000',
    );
    const link = `${baseUrl}/reset-password?token=${token}`;
    this.logger.log(`[EMAIL] Password reset for ${email}: ${link}`);
  }
}
