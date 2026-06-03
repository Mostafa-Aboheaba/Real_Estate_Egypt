import { OAuthProvider, UserRole as PrismaUserRole } from '@prisma/client';
import { AuthUser } from '../entities/auth-user.entity';
import { UserRole } from '../enums/user-role.enum';

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export interface CreateUserInput {
  email: string;
  passwordHash: string | null;
  role: UserRole;
  locale: string;
  consentAt: Date;
  name?: string | null;
}

export interface OAuthProfile {
  provider: OAuthProvider;
  providerUserId: string;
  email: string;
  name?: string | null;
}

export interface AuthRepositoryPort {
  findByEmail(email: string): Promise<AuthUser | null>;
  findById(id: string): Promise<AuthUser | null>;
  createUser(input: CreateUserInput): Promise<AuthUser>;
  markEmailVerified(userId: string): Promise<void>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
  linkOAuthAccount(profile: OAuthProfile, role: UserRole): Promise<AuthUser>;
  findByOAuth(
    provider: OAuthProvider,
    providerUserId: string,
  ): Promise<AuthUser | null>;
  saveRefreshToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void>;
  findRefreshToken(
    tokenHash: string,
  ): Promise<{ id: string; userId: string; revokedAt: Date | null } | null>;
  revokeRefreshToken(tokenHash: string): Promise<void>;
  revokeAllRefreshTokens(userId: string): Promise<void>;
  saveEmailVerificationToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void>;
  consumeEmailVerificationToken(
    tokenHash: string,
  ): Promise<{ userId: string } | null>;
  savePasswordResetToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void>;
  consumePasswordResetToken(
    tokenHash: string,
  ): Promise<{ userId: string } | null>;
}

export function toDomainRole(role: PrismaUserRole): UserRole {
  return role as UserRole;
}
