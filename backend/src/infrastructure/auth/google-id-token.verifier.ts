import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { AuthDomainException, AuthErrorCode } from '../../domain/auth/failures/auth.failures';

export interface GoogleProfile {
  sub: string;
  email: string;
  name?: string;
}

@Injectable()
export class GoogleIdTokenVerifier {
  private readonly client: OAuth2Client | null;
  private readonly clientId: string | undefined;

  constructor(config: ConfigService) {
    this.clientId = config.get<string>('oauth.googleClientId');
    this.client = this.clientId ? new OAuth2Client(this.clientId) : null;
  }

  async verify(idToken: string): Promise<GoogleProfile> {
    if (!this.client || !this.clientId) {
      throw new AuthDomainException(AuthErrorCode.OAUTH_NOT_CONFIGURED);
    }
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.clientId,
      });
      const payload = ticket.getPayload();
      if (!payload?.email || !payload.sub) {
        throw new AuthDomainException(AuthErrorCode.OAUTH_INVALID);
      }
      return {
        sub: payload.sub,
        email: payload.email.toLowerCase(),
        name: payload.name,
      };
    } catch (e) {
      if (e instanceof AuthDomainException) {
        throw e;
      }
      throw new AuthDomainException(AuthErrorCode.OAUTH_INVALID);
    }
  }
}
