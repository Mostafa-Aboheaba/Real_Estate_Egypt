import { Inject, Injectable } from '@nestjs/common';
import {
  AUTH_REPOSITORY,
  AuthRepositoryPort,
  UserProfile,
} from '../../domain/auth/ports/auth.repository.port';
import {
  AuthDomainException,
  AuthErrorCode,
} from '../../domain/auth/failures/auth.failures';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly users: AuthRepositoryPort,
  ) {}

  async execute(userId: string): Promise<UserProfile> {
    const profile = await this.users.findProfileById(userId);
    if (!profile) {
      throw new AuthDomainException(AuthErrorCode.INVALID_CREDENTIALS);
    }
    return profile;
  }
}
