import { OAuthProvider } from '../enums/oauth-provider.enum';

export const OAUTH_VERIFIER = Symbol('OAUTH_VERIFIER');

export interface OAuthIdProfile {
  sub: string;
  email: string;
  name?: string;
}

export interface OAuthVerifierPort {
  verify(provider: OAuthProvider, token: string): Promise<OAuthIdProfile>;
}
