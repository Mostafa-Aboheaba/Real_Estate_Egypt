import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { generateSecureToken, hashToken } from '../../common/utils/token-hash';
import { AuthUser } from '../../domain/auth/entities/auth-user.entity';
import {
  AccessTokenPayload,
  TokenPair,
  TokenServicePort,
} from '../../domain/auth/ports/token.service.port';
import {
  AUTH_REPOSITORY,
  AuthRepositoryPort,
} from '../../domain/auth/ports/auth.repository.port';

@Injectable()
export class JwtTokenService implements TokenServicePort {
  private readonly accessExpiresSec: number;
  private readonly refreshExpiresDays: number;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @Inject(AUTH_REPOSITORY) private readonly authRepo: AuthRepositoryPort,
  ) {
    this.accessExpiresSec = this.config.get<number>(
      'jwt.accessExpiresSec',
      900,
    );
    this.refreshExpiresDays = this.config.get<number>(
      'jwt.refreshExpiresDays',
      7,
    );
  }

  async issueTokenPair(user: AuthUser): Promise<TokenPair> {
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    });

    const refreshToken = generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.refreshExpiresDays);

    await this.authRepo.saveRefreshToken(
      user.id,
      hashToken(refreshToken),
      expiresAt,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessExpiresSec,
    };
  }

  verifyAccessToken(token: string): AccessTokenPayload | null {
    try {
      const payload = this.jwt.verify(token) as AccessTokenPayload;
      return payload;
    } catch {
      return null;
    }
  }
}
