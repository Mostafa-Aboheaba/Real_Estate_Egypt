import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { PropertyService } from '../../application/property/property.service';
import { LISTING_PROVIDER } from '../../domain/property/ports/listing-provider.port';
import { PROPERTY_REPOSITORY } from '../../domain/property/ports/property.repository.port';
import { SYNC_RUN_REPOSITORY } from '../../domain/property/ports/sync-run.repository.port';
import { ShaetyAdapter } from '../../infrastructure/listing/shaety/shaety.adapter';
import { PrismaPropertyRepository } from '../../infrastructure/persistence/property/prisma-property.repository';
import { PrismaSyncRunRepository } from '../../infrastructure/persistence/property/prisma-sync-run.repository';
import { ListingSyncProcessor } from '../../infrastructure/queue/listing-sync.processor';
import {
  EMBED_LISTING_QUEUE,
  LISTING_SYNC_QUEUE,
} from '../../infrastructure/queue/queue.constants';
import { QueueModule } from '../../infrastructure/queue/queue.module';
import { AuthModule } from '../auth/auth.module';
import { GuestSearchGuard } from '../guards/guest-search.guard';
import { OptionalJwtAuthGuard } from '../guards/optional-jwt-auth.guard';
import { AdminSyncController } from './admin-sync.controller';
import { PropertiesController } from './properties.controller';

@Module({
  imports: [
    QueueModule,
    AuthModule,
    BullModule.registerQueue({ name: LISTING_SYNC_QUEUE }),
    BullModule.registerQueue({ name: EMBED_LISTING_QUEUE }),
  ],
  controllers: [PropertiesController, AdminSyncController],
  providers: [
    PropertyService,
    ShaetyAdapter,
    ListingSyncProcessor,
    OptionalJwtAuthGuard,
    GuestSearchGuard,
    { provide: PROPERTY_REPOSITORY, useClass: PrismaPropertyRepository },
    { provide: SYNC_RUN_REPOSITORY, useClass: PrismaSyncRunRepository },
    { provide: LISTING_PROVIDER, useExisting: ShaetyAdapter },
  ],
  exports: [PropertyService, PROPERTY_REPOSITORY],
})
export class PropertiesModule {}
