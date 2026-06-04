import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PropertyService } from '../../application/property/property.service';
import { GuestSearchGuard } from '../guards/guest-search.guard';
import { OptionalJwtAuthGuard } from '../guards/optional-jwt-auth.guard';
import { SearchPropertiesQueryDto } from './dto/search-properties-query.dto';

@Controller('properties')
@Throttle({ default: { limit: 60, ttl: 60000 } })
export class PropertiesController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard, GuestSearchGuard)
  async search(@Query() query: SearchPropertiesQueryDto) {
    const result = await this.propertyService.search(query);
    return { data: result.items, meta: result.meta };
  }

  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.propertyService.getDetail(id);
  }
}
