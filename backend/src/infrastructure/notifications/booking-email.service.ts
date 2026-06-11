import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BookingEmailVars,
  renderBookingConfirmedEmail,
  renderBookingRequestAgentEmail,
} from './templates/booking-email.template';

@Injectable()
export class BookingEmailService {
  private readonly logger = new Logger(BookingEmailService.name);

  constructor(private readonly config: ConfigService) {}

  async sendBookingEmail(
    to: string,
    eventType: string,
    vars: BookingEmailVars,
  ): Promise<void> {
    const html =
      eventType === 'booking.requested'
        ? renderBookingRequestAgentEmail(vars)
        : renderBookingConfirmedEmail(vars);

    const mock = this.config.get<boolean>('notifications.emailMock', true);
    if (mock) {
      this.logger.log(
        `[EMAIL mock] to=${to} event=${eventType} subject snippet=${html.slice(0, 60)}…`,
      );
      return;
    }

    this.logger.warn(`Email mock disabled; would send ${eventType} to ${to}`);
  }
}
