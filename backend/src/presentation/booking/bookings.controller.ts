import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookingQueryService } from '../../application/booking/booking-query.service';
import { CreateBookingUseCase } from '../../application/booking/create-booking.use-case';
import { UpdateBookingUseCase } from '../../application/booking/update-booking.use-case';
import { UserRole } from '../../domain/auth/enums/user-role.enum';
import { BookingAction } from '../../domain/booking/enums/booking-status.enum';
import { AccessTokenPayload } from '../../domain/auth/ports/token.service.port';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Roles } from '../decorators/roles.decorator';
import { EmailVerifiedGuard } from '../guards/email-verified.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { toBookingResponse } from './booking.mapper';
import { BookingListQueryDto } from './dto/booking-list-query.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { ConfirmBookingDto } from './dto/confirm-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { DeclineBookingDto } from './dto/decline-booking.dto';
import { ProposeBookingDto } from './dto/propose-booking.dto';

@Controller('bookings')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard, RolesGuard)
export class BookingsController {
  constructor(
    private readonly createBooking: CreateBookingUseCase,
    private readonly updateBooking: UpdateBookingUseCase,
    private readonly query: BookingQueryService,
  ) {}

  @Post()
  @Roles(UserRole.Buyer)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateBookingDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const booking = await this.createBooking.execute({
      buyerId: user.sub,
      propertyId: dto.propertyId,
      preferredAt: new Date(dto.preferredAt),
      message: dto.message,
      idempotencyKey,
    });
    return toBookingResponse(booking);
  }

  @Get()
  @Roles(UserRole.Buyer)
  async listBuyer(
    @CurrentUser() user: AccessTokenPayload,
    @Query() query: BookingListQueryDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const result = await this.query.listBuyer(
      user.sub,
      query.status,
      page,
      limit,
    );
    return {
      data: result.items.map((item) => ({
        ...toBookingResponse(item),
        property: item.property,
      })),
      meta: result.meta,
    } as const;
  }

  @Get(':id')
  @Roles(UserRole.Buyer, UserRole.Agent)
  async getById(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const booking = await this.query.getForParticipant(id, user.sub);
    return toBookingResponse(booking);
  }

  @Patch(':id/confirm')
  @Roles(UserRole.Agent)
  async confirm(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConfirmBookingDto,
  ) {
    const booking = await this.updateBooking.execute({
      bookingId: id,
      actorUserId: user.sub,
      actor: 'agent',
      action: BookingAction.Confirm,
      scheduledAt: new Date(dto.scheduledAt),
    });
    return toBookingResponse(booking);
  }

  @Patch(':id/propose')
  @Roles(UserRole.Agent)
  async propose(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ProposeBookingDto,
  ) {
    const booking = await this.updateBooking.execute({
      bookingId: id,
      actorUserId: user.sub,
      actor: 'agent',
      action: BookingAction.Propose,
      proposedAt: new Date(dto.proposedAt),
      message: dto.message,
    });
    return toBookingResponse(booking);
  }

  @Patch(':id/decline')
  @Roles(UserRole.Agent)
  async decline(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DeclineBookingDto,
  ) {
    const booking = await this.updateBooking.execute({
      bookingId: id,
      actorUserId: user.sub,
      actor: 'agent',
      action: BookingAction.Decline,
      message: dto.reason,
    });
    return toBookingResponse(booking);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.Buyer, UserRole.Agent)
  async cancel(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelBookingDto,
  ) {
    const actor = user.role === UserRole.Agent ? 'agent' : 'buyer';
    const booking = await this.updateBooking.execute({
      bookingId: id,
      actorUserId: user.sub,
      actor,
      action: BookingAction.Cancel,
      message: dto.reason,
    });
    return toBookingResponse(booking);
  }

  @Patch(':id/complete')
  @Roles(UserRole.Agent)
  async complete(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const booking = await this.updateBooking.execute({
      bookingId: id,
      actorUserId: user.sub,
      actor: 'agent',
      action: BookingAction.Complete,
    });
    return toBookingResponse(booking);
  }
}
