import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RagOrchestratorService } from '../../application/rag/rag-orchestrator.service';
import { UserRole } from '../../domain/auth/enums/user-role.enum';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { RagRetrieveDto } from './dto/rag-retrieve.dto';

@Controller('ai/rag')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RagController {
  constructor(private readonly rag: RagOrchestratorService) {}

  @Post('retrieve')
  @Roles(UserRole.Admin, UserRole.Agent)
  async retrieve(@Body() dto: RagRetrieveDto) {
    return this.rag.retrieve({
      query: dto.query,
      topK: dto.topK,
      filters: {
        city: dto.city,
        governorate: dto.governorate,
        listingType: dto.listingType,
        minPriceEgp: dto.minPriceEgp,
        maxPriceEgp: dto.maxPriceEgp,
        includeFaq: dto.includeFaq,
      },
    });
  }
}
