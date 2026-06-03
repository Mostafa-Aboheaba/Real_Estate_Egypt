import { AuthUser } from '../entities/auth-user.entity';

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
  emailVerified: boolean;
}

export interface TokenServicePort {
  issueTokenPair(user: AuthUser): Promise<TokenPair>;
  verifyAccessToken(token: string): AccessTokenPayload | null;
}
