import { Injectable } from '@nestjs/common';
import { OAuthProvider } from '../../domain/auth/enums/oauth-provider.enum';
import {
  OAuthIdProfile,
  OAuthVerifierPort,
} from '../../domain/auth/ports/oauth-verifier.port';
import { AppleIdTokenVerifier } from './apple-id-token.verifier';
import { GoogleIdTokenVerifier } from './google-id-token.verifier';

@Injectable()
export class OAuthVerifierAdapter implements OAuthVerifierPort {
  constructor(
    private readonly google: GoogleIdTokenVerifier,
    private readonly apple: AppleIdTokenVerifier,
  ) {}

  verify(provider: OAuthProvider, token: string): Promise<OAuthIdProfile> {
    return provider === OAuthProvider.Google
      ? this.google.verify(token)
      : this.apple.verify(token);
  }
}
