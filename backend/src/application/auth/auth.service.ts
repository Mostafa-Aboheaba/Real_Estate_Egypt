import { Inject, Injectable } from '@nestjs/common';
import { OAuthProvider } from '@prisma/client';
import { generateSecureToken, hashToken } from '../../common/utils/token-hash';
import { AuthUser } from '../../domain/auth/entities/auth-user.entity';
import {
  AuthDomainException,
  AuthErrorCode,
} from '../../domain/auth/failures/auth.failures';
import { parseUserRole, UserRole } from '../../domain/auth/enums/user-role.enum';
import { Email } from '../../domain/auth/value-objects/email.vo';
import { Password } from '../../domain/auth/value-objects/password.vo';
import {
  AUTH_REPOSITORY,
  AuthRepositoryPort,
} from '../../domain/auth/ports/auth.repository.port';
import {
  TOKEN_SERVICE,
  TokenPair,
  TokenServicePort,
} from '../../domain/auth/ports/token.service.port';
import { EmailService } from '../../infrastructure/auth/email.service';
import { PasswordService } from '../../infrastructure/auth/password.service';
import { GoogleIdTokenVerifier } from '../../infrastructure/auth/google-id-token.verifier';
import { AppleIdTokenVerifier } from '../../infrastructure/auth/apple-id-token.verifier';

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    role: string;
    emailVerified: boolean;
    locale: string;
    name: string | null;
  };
  isNewUser?: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly repo: AuthRepositoryPort,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenServicePort,
    private readonly passwords: PasswordService,
    private readonly emailService: EmailService,
    private readonly googleVerifier: GoogleIdTokenVerifier,
    private readonly appleVerifier: AppleIdTokenVerifier,
  ) {}

  async register(input: {
    email: string;
    password: string;
    role: string;
    locale: string;
    consentAccepted: boolean;
  }): Promise<{ userId: string; email: string; role: string; emailVerified: boolean }> {
    if (!input.consentAccepted) {
      throw new AuthDomainException(AuthErrorCode.CONSENT_REQUIRED);
    }

    const email = Email.create(input.email);
    if (!email) {
      throw new AuthDomainException(AuthErrorCode.VALIDATION_ERROR);
    }

    const password = Password.create(input.password);
    if (!password) {
      throw new AuthDomainException(AuthErrorCode.VALIDATION_ERROR);
    }

    const role = parseUserRole(input.role);
    if (!role) {
      throw new AuthDomainException(AuthErrorCode.VALIDATION_ERROR);
    }

    const existing = await this.repo.findByEmail(email.value);
    if (existing) {
      throw new AuthDomainException(AuthErrorCode.DUPLICATE_EMAIL);
    }

    const passwordHash = await this.passwords.hash(password.value);
    const user = await this.repo.createUser({
      email: email.value,
      passwordHash,
      role,
      locale: input.locale,
      consentAt: new Date(),
    });

    const verifyToken = generateSecureToken();
    await this.repo.saveEmailVerificationToken(
      user.id,
      hashToken(verifyToken),
      new Date(Date.now() + 24 * 60 * 60 * 1000),
    );
    await this.emailService.sendVerificationEmail(user.email, verifyToken);

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      emailVerified: false,
    };
  }

  async verifyEmail(token: string): Promise<void> {
    const consumed = await this.repo.consumeEmailVerificationToken(
      hashToken(token),
    );
    if (!consumed) {
      throw new AuthDomainException(AuthErrorCode.INVALID_TOKEN);
    }
    await this.repo.markEmailVerified(consumed.userId);
  }

  async login(emailRaw: string, passwordRaw: string): Promise<AuthResponseDto> {
    const email = Email.create(emailRaw);
    if (!email) {
      throw new AuthDomainException(AuthErrorCode.INVALID_CREDENTIALS);
    }

    const user = await this.repo.findByEmail(email.value);
    if (!user?.passwordHash) {
      throw new AuthDomainException(AuthErrorCode.INVALID_CREDENTIALS);
    }

    const valid = await this.passwords.compare(passwordRaw, user.passwordHash);
    if (!valid) {
      throw new AuthDomainException(AuthErrorCode.INVALID_CREDENTIALS);
    }

    return this.toAuthResponse(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    const stored = await this.repo.findRefreshToken(hashToken(refreshToken));
    if (!stored || stored.revokedAt) {
      throw new AuthDomainException(AuthErrorCode.INVALID_TOKEN);
    }

    await this.repo.revokeRefreshToken(hashToken(refreshToken));

    const user = await this.repo.findById(stored.userId);
    if (!user) {
      throw new AuthDomainException(AuthErrorCode.INVALID_TOKEN);
    }

    return this.toAuthResponse(user);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.repo.revokeRefreshToken(hashToken(refreshToken));
  }

  async forgotPassword(emailRaw: string): Promise<void> {
    const email = Email.create(emailRaw);
    if (!email) {
      return;
    }
    const user = await this.repo.findByEmail(email.value);
    if (!user) {
      return;
    }
    const token = generateSecureToken();
    await this.repo.savePasswordResetToken(
      user.id,
      hashToken(token),
      new Date(Date.now() + 60 * 60 * 1000),
    );
    await this.emailService.sendPasswordResetEmail(user.email, token);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const password = Password.create(newPassword);
    if (!password) {
      throw new AuthDomainException(AuthErrorCode.VALIDATION_ERROR);
    }

    const consumed = await this.repo.consumePasswordResetToken(
      hashToken(token),
    );
    if (!consumed) {
      throw new AuthDomainException(AuthErrorCode.INVALID_TOKEN);
    }

    const hash = await this.passwords.hash(password.value);
    await this.repo.updatePassword(consumed.userId, hash);
    await this.repo.revokeAllRefreshTokens(consumed.userId);
  }

  async googleAuth(
    idToken: string,
    roleRaw?: string,
  ): Promise<AuthResponseDto> {
    const profile = await this.googleVerifier.verify(idToken);
    return this.oauthLogin(
      OAuthProvider.google,
      profile.sub,
      profile.email,
      profile.name,
      roleRaw,
    );
  }

  async appleAuth(
    identityToken: string,
    roleRaw?: string,
  ): Promise<AuthResponseDto> {
    const profile = await this.appleVerifier.verify(identityToken);
    return this.oauthLogin(
      OAuthProvider.apple,
      profile.sub,
      profile.email,
      undefined,
      roleRaw,
    );
  }

  private async oauthLogin(
    provider: OAuthProvider,
    providerUserId: string,
    email: string,
    name: string | undefined,
    roleRaw?: string,
  ): Promise<AuthResponseDto> {
    let user = await this.repo.findByOAuth(provider, providerUserId);
    let isNewUser = false;

    if (!user) {
      const byEmail = await this.repo.findByEmail(email);
      if (byEmail) {
        user = byEmail;
        await this.repo.linkOAuthAccount(
          { provider, providerUserId, email, name },
          byEmail.role,
        );
      } else {
        const role = parseUserRole(roleRaw ?? 'buyer') ?? UserRole.Buyer;
        user = await this.repo.linkOAuthAccount(
          { provider, providerUserId, email, name },
          role,
        );
        isNewUser = true;
      }
    }

    const response = await this.toAuthResponse(user);
    response.isNewUser = isNewUser;
    return response;
  }

  private async toAuthResponse(user: AuthUser): Promise<AuthResponseDto> {
    const pair = await this.tokens.issueTokenPair(user);
    return {
      ...pair,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        locale: user.locale,
        name: user.name,
      },
    };
  }
}
