import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProfileModule } from '../profile/profile.module';
import { UsersController } from './users.controller';

@Module({
  imports: [AuthModule, ProfileModule],
  controllers: [UsersController],
})
export class UsersModule {}
