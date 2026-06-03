import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import {
  AuthDomainException,
  AuthErrorCode,
} from '../../domain/auth/failures/auth.failures';

export interface AppleProfile {
  sub: string;
  email: string;
}

@Injectable()
export class AppleIdTokenVerifier {
  private readonly clientId: string | undefined;
  private readonly jwks: JwksClient;

  constructor(config: ConfigService) {
    this.clientId = config.get<string>('oauth.appleClientId');
    this.jwks = new JwksClient({
      jwksUri: 'https://appleid.apple.com/auth/keys',
      cache: true,
    });
  }

  async verify(identityToken: string): Promise<AppleProfile> {
    if (!this.clientId) {
      throw new AuthDomainException(AuthErrorCode.OAUTH_NOT_CONFIGURED);
    }
    try {
      const decoded = jwt.decode(identityToken, { complete: true });
      if (!decoded || typeof decoded === 'string' || !decoded.header.kid) {
        throw new AuthDomainException(AuthErrorCode.OAUTH_INVALID);
      }
      const key = await this.jwks.getSigningKey(decoded.header.kid);
      const payload = jwt.verify(identityToken, key.getPublicKey(), {
        algorithms: ['RS256'],
        audience: this.clientId,
        issuer: 'https://appleid.apple.com',
      }) as jwt.JwtPayload;

      const sub = payload.sub;
      const email =
        (payload.email as string | undefined) ??
        `${sub}@privaterelay.appleid.com`;

      if (!sub) {
        throw new AuthDomainException(AuthErrorCode.OAUTH_INVALID);
      }

      return { sub, email: email.toLowerCase() };
    } catch (e) {
      if (e instanceof AuthDomainException) {
        throw e;
      }
      throw new AuthDomainException(AuthErrorCode.OAUTH_INVALID);
    }
  }
}
