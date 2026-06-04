import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PropertyService } from '../../application/property/property.service';
import { UserRole } from '../../domain/auth/enums/user-role.enum';
import { ListingProvider } from '../../domain/property/enums/listing-provider.enum';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('admin/sync')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminSyncController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get('status')
  @Roles(UserRole.Agent, UserRole.Admin)
  async status() {
    return this.propertyService.getSyncStatus();
  }

  @Post(':provider/trigger')
  @HttpCode(HttpStatus.ACCEPTED)
  @Roles(UserRole.Admin)
  async trigger(@Param('provider') providerParam: string) {
    const provider = parseProvider(providerParam);
    const jobId = await this.propertyService.enqueueSync(provider);
    return {
      jobId,
      provider,
      enqueuedAt: new Date().toISOString(),
      message: 'sync_job_enqueued',
    };
  }
}

function parseProvider(value: string): ListingProvider {
  const normalized = value.toLowerCase().replace(/-/g, '_');
  const match = Object.values(ListingProvider).find((p) => p === normalized);
  if (!match) {
    throw new BadRequestException(`Unknown provider: ${value}`);
  }
  return match;
}
