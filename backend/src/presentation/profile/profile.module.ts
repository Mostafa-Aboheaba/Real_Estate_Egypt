import { Module } from '@nestjs/common';
import { ProfileService } from '../../application/profile/profile.service';
import { AGENT_CATALOG } from '../../domain/profile/ports/agent-catalog.port';
import { PROFILE_REPOSITORY } from '../../domain/profile/ports/profile.repository.port';
import { PrismaAgentCatalog } from '../../infrastructure/persistence/profile/prisma-agent-catalog';
import { PrismaProfileRepository } from '../../infrastructure/persistence/profile/prisma-profile.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [
    ProfileService,
    { provide: PROFILE_REPOSITORY, useClass: PrismaProfileRepository },
    { provide: AGENT_CATALOG, useClass: PrismaAgentCatalog },
  ],
  exports: [ProfileService, PROFILE_REPOSITORY],
})
export class ProfileModule {}
