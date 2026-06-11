import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { BookingQueryService } from '../../application/booking/booking-query.service';
import { UserRole } from '../../domain/auth/enums/user-role.enum';
import { AccessTokenPayload } from '../../domain/auth/ports/token.service.port';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Roles } from '../decorators/roles.decorator';
import { EmailVerifiedGuard } from '../guards/email-verified.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { toBookingResponse } from './booking.mapper';
import { BookingListQueryDto } from './dto/booking-list-query.dto';

@Controller('agent/bookings')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard, RolesGuard)
@Roles(UserRole.Agent)
export class AgentBookingsController {
  constructor(private readonly query: BookingQueryService) {}

  @Get()
  async list(
    @CurrentUser() user: AccessTokenPayload,
    @Query() query: BookingListQueryDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const result = await this.query.listAgent(
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
    };
  }
}
