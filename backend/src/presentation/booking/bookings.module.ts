import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { BookingQueryService } from '../../application/booking/booking-query.service';
import { CreateBookingUseCase } from '../../application/booking/create-booking.use-case';
import { UpdateBookingUseCase } from '../../application/booking/update-booking.use-case';
import { NotificationEnqueueService } from '../../application/notification/notification-enqueue.service';
import { BOOKING_REPOSITORY } from '../../domain/booking/ports/booking.repository.port';
import { NOTIFICATION_REPOSITORY } from '../../domain/notification/ports/notification.repository.port';
import { BookingEmailService } from '../../infrastructure/notifications/booking-email.service';
import { FcmService } from '../../infrastructure/notifications/fcm.service';
import { NotificationDispatchService } from '../../infrastructure/notifications/notification-dispatch.service';
import { PrismaBookingRepository } from '../../infrastructure/persistence/booking/prisma-booking.repository';
import { PrismaNotificationRepository } from '../../infrastructure/persistence/notification/prisma-notification.repository';
import { NotificationProcessor } from '../../infrastructure/queue/notification.processor';
import { NOTIFICATIONS_QUEUE } from '../../infrastructure/queue/queue.constants';
import { AuthModule } from '../auth/auth.module';
import { AgentBookingsController } from './agent-bookings.controller';
import { BookingsController } from './bookings.controller';

@Module({
  imports: [
    AuthModule,
    BullModule.registerQueue({ name: NOTIFICATIONS_QUEUE }),
  ],
  controllers: [BookingsController, AgentBookingsController],
  providers: [
    CreateBookingUseCase,
    UpdateBookingUseCase,
    BookingQueryService,
    NotificationEnqueueService,
    NotificationDispatchService,
    NotificationProcessor,
    FcmService,
    BookingEmailService,
    { provide: BOOKING_REPOSITORY, useClass: PrismaBookingRepository },
    { provide: NOTIFICATION_REPOSITORY, useClass: PrismaNotificationRepository },
  ],
  exports: [CreateBookingUseCase, UpdateBookingUseCase, BookingQueryService],
})
export class BookingsModule {}
