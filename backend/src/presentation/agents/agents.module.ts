import { Module } from '@nestjs/common';
import { ProfileModule } from '../profile/profile.module';
import { AgentsController } from './agents.controller';

@Module({
  imports: [ProfileModule],
  controllers: [AgentsController],
})
export class AgentsModule {}
