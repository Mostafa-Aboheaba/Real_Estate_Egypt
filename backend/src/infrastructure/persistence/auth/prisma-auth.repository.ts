import { Injectable } from '@nestjs/common';
import {
  OAuthProvider as PrismaOAuthProvider,
  User,
  UserRole as PrismaUserRole,
} from '@prisma/client';
import { AuthUser } from '../../../domain/auth/entities/auth-user.entity';
import { OAuthProvider } from '../../../domain/auth/enums/oauth-provider.enum';
import { UserRole } from '../../../domain/auth/enums/user-role.enum';
import {
  AuthRepositoryPort,
  CreateUserInput,
  OAuthProfile,
  UserProfile,
} from '../../../domain/auth/ports/auth.repository.port';
import { PrismaService } from '../prisma/prisma.service';

function toDomainRole(role: PrismaUserRole): UserRole {
  return role as UserRole;
}

function toPrismaOAuth(provider: OAuthProvider): PrismaOAuthProvider {
  return provider as PrismaOAuthProvider;
}

@Injectable()
export class PrismaAuthRepository implements AuthRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private mapUser(row: User): AuthUser {
    return new AuthUser(
      row.id,
      row.email,
      toDomainRole(row.role),
      row.emailVerified,
      row.locale,
      row.name,
      row.passwordHash,
    );
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    const row = await this.prisma.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
    });
    return row ? this.mapUser(row) : null;
  }

  async findById(id: string): Promise<AuthUser | null> {
    const row = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    return row ? this.mapUser(row) : null;
  }

  async findProfileById(id: string): Promise<UserProfile | null> {
    const row = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        locale: true,
        emailVerified: true,
        preferredAgentId: true,
      },
    });
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      email: row.email,
      role: row.role,
      name: row.name,
      locale: row.locale,
      emailVerified: row.emailVerified,
      preferredAgentId: row.preferredAgentId,
    };
  }

  async createUser(input: CreateUserInput): Promise<AuthUser> {
    const row = await this.prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash,
        role: input.role,
        locale: input.locale,
        consentAt: input.consentAt,
        name: input.name ?? null,
        emailVerified: false,
      },
    });
    return this.mapUser(row);
  }

  async markEmailVerified(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async findByOAuth(
    provider: OAuthProvider,
    providerUserId: string,
  ): Promise<AuthUser | null> {
    const link = await this.prisma.oauthAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider: toPrismaOAuth(provider),
          providerUserId,
        },
      },
      include: { user: true },
    });
    if (!link?.user || link.user.deletedAt) {
      return null;
    }
    return this.mapUser(link.user);
  }

  async linkOAuthAccount(
    profile: OAuthProfile,
    role: UserRole,
  ): Promise<AuthUser> {
    const existing = await this.findByEmail(profile.email);
    if (existing) {
      await this.prisma.oauthAccount.upsert({
        where: {
          provider_providerUserId: {
            provider: toPrismaOAuth(profile.provider),
            providerUserId: profile.providerUserId,
          },
        },
        create: {
          userId: existing.id,
          provider: toPrismaOAuth(profile.provider),
          providerUserId: profile.providerUserId,
        },
        update: {},
      });
      return existing;
    }

    const user = await this.prisma.user.create({
      data: {
        email: profile.email.toLowerCase(),
        passwordHash: null,
        role,
        locale: 'ar-EG',
        name: profile.name ?? null,
        emailVerified: true,
        consentAt: new Date(),
        oauthAccounts: {
          create: {
            provider: toPrismaOAuth(profile.provider),
            providerUserId: profile.providerUserId,
          },
        },
      },
    });
    return this.mapUser(user);
  }

  async saveRefreshToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  async findRefreshToken(
    tokenHash: string,
  ): Promise<{ id: string; userId: string; revokedAt: Date | null } | null> {
    return this.prisma.refreshToken.findFirst({
      where: { tokenHash, expiresAt: { gt: new Date() } },
      select: { id: true, userId: true, revokedAt: true },
    });
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllRefreshTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async saveEmailVerificationToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.prisma.emailVerificationToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  async consumeEmailVerificationToken(
    tokenHash: string,
  ): Promise<{ userId: string } | null> {
    const row = await this.prisma.emailVerificationToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (!row) {
      return null;
    }
    await this.prisma.emailVerificationToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    });
    return { userId: row.userId };
  }

  async savePasswordResetToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.prisma.passwordResetToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  async consumePasswordResetToken(
    tokenHash: string,
  ): Promise<{ userId: string } | null> {
    const row = await this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (!row) {
      return null;
    }
    await this.prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    });
    return { userId: row.userId };
  }
}
