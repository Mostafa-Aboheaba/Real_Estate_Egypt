import { Module } from '@nestjs/common';
import { GetCurrentUserUseCase } from '../../application/users/get-current-user.use-case';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from './users.controller';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [GetCurrentUserUseCase],
})
export class UsersModule {}
